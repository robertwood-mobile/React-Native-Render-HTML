/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { ReflectionKind } = require('typedoc');
const { writeFile, readdir, unlink } = require('fs/promises');
const { join } = require('path');

/** @type {Record<string, import('typedoc').JSONOutput.DeclarationReflection>} */
let reflectionsRegistry = {};

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractFrontmatter(reflection) {
  const lowercase = reflection.name.toLowerCase();
  return `---
id: ${lowercase}  
title: ${reflection.name}
---
import DeclarationBox from '@site/src/typeui/DeclarationBox';
import HeaderTypeBox from '@site/src/typeui/HeaderTypeBox';
import Reference from '@site/src/components/Reference';
\n\n`;
}

function renderReference(name, url, member) {
  const serializedMember = member ? `member=${JSON.stringify(member)}` : '';
  return `&ZeroWidthSpace;<Reference name=${JSON.stringify(
    name
  )} url=${JSON.stringify(url)} type="api-def" ${serializedMember} />`;
}

/**
 *
 * @param {string} linkValue
 */
function resolveLink(linkValue) {
  const match = /\s*(.+)\s*\|\s*(.+)\s*/.exec(linkValue);
  if (match) {
    return `[${match[2]}](${match[1]})`;
  }
  const linkreg = /(\S+)\.(\S+)/.exec(linkValue);
  if (linkreg) {
    const [m, reference, member] = linkreg;
    if (reference in reflectionsRegistry) {
      const url = `/api/${reflectionsRegistry[
        reference
      ].name.toLowerCase()}#${member.toLowerCase()}`;
      return renderReference(linkValue, url, member);
    }
  }
  if (linkValue in reflectionsRegistry) {
    return renderReference(
      linkValue,
      `/api/${reflectionsRegistry[linkValue].name.toLowerCase()}`
    );
  }
  console.warn('Unresolved link to', linkValue);
  return linkValue;
}

/**
 *
 * @param {string} text
 */
function parseLinks(text) {
  const matcher = /\{@link\s+(.*?)\s*\}/gi;
  let retStr = text;
  /** @type {RegExpExecArray} */
  let result;
  while ((result = matcher.exec(text))) {
    const [match, linkexpr] = result;
    retStr = retStr.replace(match, resolveLink(linkexpr));
  }
  return retStr;
}

/**
 *
 * @param {import('typedoc').JSONOutput.CommentTag} remarks
 */
function extractRemarks(remarks) {
  return `
:::info Remarks

${parseLinks(remarks.text)}

:::  
`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.CommentTag} remarks
 */
function extractDeprecated(deprecated) {
  return `
:::warning Deprecated

This feature will be removed in the next major release.
${parseLinks(deprecated.text)}

:::  
`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.CommentTag} warnings
 */
function extractWarning(warnings) {
  return `
:::warning

${parseLinks(warnings.text)}

:::  
`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.CommentTag} example
 * @param {boolean} isHeader
 */
function extractExample(example, isHeader) {
  const title = isHeader ? '## Example' : '#### Example';
  return `${title}\n\n${parseLinks(example.text)}\n\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.Comment} comment
 */
function extractComment(comment) {
  if (!comment) {
    return '';
  }
  return `\n${parseLinks(comment.shortText ?? '')}\n\n${parseLinks(
    comment.text ?? ''
  )}\n\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.Comment} comment
 * @param {boolean} isHeader
 */
function extractAdmonitions(comment, isHeader) {
  if (!comment) {
    return '';
  }
  const remarks = comment.tags && comment.tags.find((t) => t.tag === 'remarks');
  const warning = comment.tags && comment.tags.find((t) => t.tag === 'warning');
  const example = comment.tags && comment.tags.find((t) => t.tag === 'example');
  const deprecated =
    comment.tags && comment.tags.find((t) => t.tag === 'deprecated');
  return `\n${deprecated ? extractDeprecated(deprecated) : ''}${
    remarks ? extractRemarks(remarks) : ''
  }${warning ? extractWarning(warning) : ''}${
    example ? extractExample(example, isHeader) : ''
  }\n\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.SignatureReflection[]} signatures
 */
function extractSignatureComment(signatures) {
  if (signatures) {
    return extractDefinitionBody(signatures[0]);
  }
  return '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.SignatureReflection[]} signatures
 */
function extractSignatureParams(signatures) {
  if (signatures) {
    const sig = signatures[0];
    const params = sig.parameters;
    if (!params) {
      return '';
    }
    const serializedParams = params
      .map((p) => {
        if (p.comment) {
          return `<dt><code>${p.name}</code></dt><dd>

${extractDefinitionBody(p)}
        
</dd>`;
        }
        return null;
      })
      .filter((p) => p !== null);
    return serializedParams.length
      ? `#### Parameters
      
<dl>${serializedParams.join('\n')}</dl>`
      : '';
  }
  return '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractDeclarationBox(reflection) {
  return `\n\n<DeclarationBox reflection="${encodeURIComponent(
    JSON.stringify(reflection)
  )}" />\n\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractDefaultValue(reflection) {
  const defaultValueTagText = reflection.comment?.tags
    ?.find((t) => t.tag.match(/^defaultvalue$/i))
    ?.text.replace(/`/g, '');
  const defaultValue = reflection.defaultValue || defaultValueTagText;
  return defaultValue ? `**Default**: \`${defaultValue}\`\n` : '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractReturnValue(reflection) {
  const returnsTagText = reflection.comment?.tags?.find((t) =>
    t.tag.match(/^returns$/i)
  );
  return returnsTagText
    ? `**Returns**: ${parseLinks(returnsTagText.text)}`
    : '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 * @param {boolean} isHeader
 */
function extractDefinitionBody(reflection, isHeader = false) {
  return `${extractComment(reflection.comment)}${extractDefaultValue(
    reflection
  )}\n${extractReturnValue(reflection)}\n${extractAdmonitions(
    reflection.comment,
    isHeader
  )}\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractMemberBox(reflection) {
  if (reflection.name === '__namedParameters') {
    reflection.name = 'props';
  }
  return `### \`${reflection.name}\`\n${extractDeclarationBox(
    reflection
  )}\n${extractDefinitionBody(reflection)}${extractSignatureComment(
    reflection.signatures
  )}${extractSignatureParams(reflection.signatures)}\n`;
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 * @param {import('typedoc').JSONOutput.ReflectionKind} kind
 */
function filterChildrenByKind(reflection, kind) {
  return reflection.children?.filter((c) => c.kind === kind);
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractProperties(reflection) {
  const properties = filterChildrenByKind(reflection, ReflectionKind.Property);
  const hasProperties = !!properties?.length;
  return hasProperties
    ? '## Fields \n\n' + properties.map(extractMemberBox).join('\n')
    : '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractMethods(reflection) {
  const methods = filterChildrenByKind(reflection, ReflectionKind.Method);
  const hasMethods = !!methods?.length;
  return hasMethods
    ? '## Methods \n\n' + methods.map(extractMemberBox).join('\n')
    : '';
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractEnumMembers(reflection) {
  const enumMembers = filterChildrenByKind(
    reflection,
    ReflectionKind.EnumMember
  );
  const hasMembers = !!enumMembers?.length;
  return hasMembers
    ? '## Members \n\n' + enumMembers.map(extractMemberBox).join('\n')
    : '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.SignatureReflection[]} signatures
 */
function extractSignatureParameters(signatures) {
  if (signatures) {
    let ret = '';
    const sig = signatures[0];
    const parameters = sig.parameters;
    if (parameters) {
      ret += '## Parameters\n\n' + parameters.map(extractMemberBox).join('\n');
    }
    if (sig.comment?.returns) {
      ret += '## Returns\n\n' + parseLinks(sig.comment.returns) + '\n';
    }
    return ret;
  }
  return '';
}

/**
 *
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractReflectionBody(reflection) {
  return `${extractProperties(reflection)}${extractMethods(
    reflection
  )}${extractEnumMembers(reflection)}${extractSignatureParameters(
    reflection.signatures
  )}`;
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractBody(reflection) {
  switch (reflection.kind) {
    case ReflectionKind.Interface:
    case ReflectionKind.TypeAlias:
    case ReflectionKind.Function:
    case ReflectionKind.Variable:
    case ReflectionKind.Class:
    case ReflectionKind.Enum:
      return extractReflectionBody(reflection);
    case ReflectionKind.Reference:
      /**@type {import('typedoc').JSONOutput.ReferenceReflection} */
      const ref = reflection;
      // TODO handle
      return ``;
    default:
      console.warn(reflection.kindString);
      throw new Error('Unhandled reflection kind');
  }
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 */
function extractTypeParameter(reflection) {
  const parameters = []
    .concat(...(reflection.typeParameter || []))
    .concat(
      ...(reflection.signatures?.map((s) => s.typeParameter || []).flat() || [])
    );
  if (parameters.length === 0) {
    return '';
  }
  return `## Type Parameters\n\n${parameters
    .map((t) => {
      return `### \`${t.name}\`\n\n${extractDefinitionBody(t)}`;
    })
    .join('\n\n')}`;
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 * @param {string} version
 */
function extractHeader(reflection, version) {
  return `\n\n<HeaderTypeBox reflectionId={${
    reflection.id
  }} version=${JSON.stringify(version)} />\n\n`;
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection} reflection
 * @param {string} version
 */
function serialize(reflection, version) {
  return `${extractFrontmatter(reflection)}
  ${extractHeader(reflection, version)}
  ${extractDefinitionBody(reflection, true)}
  ${extractSignatureComment(reflection.signatures)}
${extractTypeParameter(reflection)}\n\n${extractBody(reflection)}`;
}

/**
 * @param {import('typedoc').JSONOutput.DeclarationReflection['type']} type
 */
function typeNameMatchElement(type) {
  if (!type) {
    return false;
  }
  return type?.name?.match(/element/i);
}

/**
 *
 * @param {{ label: string; items: import('typedoc').JSONOutput.DeclarationReflection[] }} definitions
 * @param {string} absolutePath
 */
function extractIndex(definitions, absolutePath) {
  return `---
id: index
slug: ./
title: API Reference
---
import Reference from '@site/src/components/Reference';

${definitions.reduce((prev, curr) => {
  return `${prev}\n\n## ${curr.label}

${curr.description}

<ul>
${curr.items.reduce((p, c) => {
  const url = join(`/${absolutePath}`, `/${c.name.toLowerCase()}`);
  return `${p}\n<li className="li-api-reference"><Reference type="api-def" name="${c.name}" url="${url}"/></li>`;
}, '')}
</ul>
`;
}, '')}

`;
}

/**
 * @param {import('typedoc').JSONOutput.ProjectReflection} reflections
 * @param {string} outDir
 * @param {string} sidebarFile
 * @param {string} absolutePath
 * @param {string} version
 */
module.exports = async function genPages(
  reflections,
  outDir,
  sidebarFile,
  absolutePath,
  version
) {
  const files = await readdir(outDir);
  reflectionsRegistry = {};
  for (const file of files) {
    if (file.match(/\.mdx$/)) {
      await unlink(join(outDir, file));
    }
  }
  const filteredChildren = reflections.children.filter(
    (c) => c.kind !== ReflectionKind.Namespace
  );
  const sidebarGroups = {
    exportedValues: [],
    exportedHooks: [],
    exportedComponents: [],
    exportedTypes: [],
    externals: []
  };
  for (const child of filteredChildren) {
    if (child.name === 'default') {
      child.name = 'RenderHTML';
    }
    reflectionsRegistry[child.name] = child;
  }
  for (const child of filteredChildren) {
    await writeFile(
      `${outDir}/${child.name.toLowerCase()}.mdx`,
      serialize(child, version)
    );
    if (child.flags.isExternal) {
      sidebarGroups.externals.push(child);
    } else {
      switch (child.kind) {
        case ReflectionKind.Class:
        case ReflectionKind.Enum:
          sidebarGroups.exportedValues.push(child);
          break;
        case ReflectionKind.Function:
        case ReflectionKind.Variable:
          if (child.name.startsWith('use')) {
            sidebarGroups.exportedHooks.push(child);
          } else if (
            (child.signatures &&
              typeNameMatchElement(child.signatures[0].type)) ||
            typeNameMatchElement(
              child.type?.declaration?.signatures?.[0].type
            ) ||
            child.signatures?.[0].type.types?.some(typeNameMatchElement) ||
            child.type?.name === 'NamedExoticComponent'
          ) {
            sidebarGroups.exportedComponents.push(child);
          } else {
            sidebarGroups.exportedValues.push(child);
          }
          break;
        default:
          sidebarGroups.exportedTypes.push(child);
      }
    }
  }
  console.info(`wrote documentation files to ${outDir}`);
  const reflectionToSidebar = (c) => ({
    type: 'doc',
    id: c.name.toLowerCase()
  });
  const sortDefinitions = (r1, r2) => {
    return r1.name.toLowerCase() > r2.name.toLowerCase() ? 1 : -1;
  };
  const definitions = [
    {
      type: 'category',
      label: 'Components',
      description: 'React Components exported by this library.',
      items: sidebarGroups.exportedComponents.sort(sortDefinitions)
    },
    {
      type: 'category',
      label: 'Hooks',
      description: 'React Hooks exported by this library.',
      items: sidebarGroups.exportedHooks.sort(sortDefinitions)
    },
    {
      type: 'category',
      label: 'Other Exports',
      description:
        'Other constants exported by this library, such as defaults and utilities.',
      items: sidebarGroups.exportedValues.sort(sortDefinitions)
    },
    {
      type: 'category',
      label: 'Types',
      description: 'TypeScript definitions exported by this library.',
      items: sidebarGroups.exportedTypes.sort(sortDefinitions)
    },
    {
      type: 'category',
      label: 'Externals',
      description:
        'Reexports from direct dependencies of `react-native-render-html`.',
      items: sidebarGroups.externals.sort(sortDefinitions)
    }
  ];
  const sidebaritems = [{ type: 'doc', id: 'index' }].concat(
    definitions.map(({ items, type, label }) => ({
      type,
      label,
      items: items.map(reflectionToSidebar)
    }))
  );
  await writeFile(
    sidebarFile,
    JSON.stringify({ apiSidebar: sidebaritems }, null, 2)
  );
  console.info(`wrote sidebar to ${sidebarFile}`);
  await writeFile(
    join(outDir, 'index.mdx'),
    extractIndex(definitions, absolutePath)
  );
  console.info(`wrote documentation index to ${join(outDir, 'index.mdx')}`);
};

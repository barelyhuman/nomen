import * as acorn from 'acorn'
// import { generate } from '@barelyhuman/astring-jsx'
import jsx from 'acorn-jsx'
import classFields from 'acorn-class-fields'
import { importAssertions } from 'acorn-import-assertions'
import staticClassFeatures from 'acorn-static-class-features'

const jsxParser = acorn.Parser.extend(
  jsx(),
  classFields,
  importAssertions,
  staticClassFeatures
)

/**
 * NOT A PURE FUNCTION!
 * modifies the passed AST with the
 * requested import
 *
 * Note:
 * This function does not rename / or add a new identifier for the
 * requested import as that could add in a lot more complexity
 * and is easier handled in the user land. Changing and renaming
 * import specifier would also need proper tranformation to be handled
 * for cases where the imports might be responsible for things
 * like JSX.
 * @param {string} name
 * @param {string} from
 * @param {object} options
 * @param {boolean} options.named
 */
export function addImportToAST(ast) {
  return (name, from, { named }) => {
    for (let child of ast.body) {
      if (child.type !== 'ImportDeclaration') continue

      // Check if the node is a Literal (String/Number) and is the same value
      // as requested for import. If not, just continue to the next child
      if (!(child.source.type === 'Literal' && child.source.value === from))
        continue

      // Go through the imports to check if the import (either named or default)
      // exists already in the code
      // if yes, then do nothing.
      const hasExistingImport =
        child.specifiers.findIndex(x => {
          if (named)
            return x.type === 'ImportSpecifier' && x.imported.name === name
          else
            return x.type === 'ImportDefaultSpecifier' && x.local.name === name
        }) > -1

      if (hasExistingImport) return
    }

    const importAST = astFromCode(
      named
        ? `import { ${name} } from "${from}";`
        : `import ${name} from "${from}"`
    )

    ast.body.unshift(importAST.body[0])
  }
}

function astFromCode(code) {
  const ast = jsxParser.parse(code, {
    sourceType: 'module',
    ecmaVersion: '2020',
  })
  return ast
}

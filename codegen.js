const codegen = (function() {
  const primitives = ['div', 'a', 'p', 'span', 'button', 'input', 'select', 'option', 'textarea', 'img'];
  function codegen(model) {
    let code = `// Component generated by chokha
    `;
    code += genImports(model);
    code += genComponent(model);
    return code;
  }

  function genImports(model) {
    const code = `import { h } from '../vendor/preact.module.js'`;
    // const imports = Object.keys(model._componentregistry || {}).filter(component => !primitives.includes(component)).map(component => {
    //   return `import ${component.replace(".mjs", "")} from './components/${component}'`;
    // });
    const imports = [];
    return [code].concat(imports).join(`
    `);
  }

  function genComponent(model) {
    const args = Object.keys(model.arguments || {}).join(',');
    const defaults = Object.keys(model.arguments || {}).map(prop => {
      return `${prop} = ${prop} !== undefined ? ${prop} : ${model.arguments[prop]} ;`;
    }).join(`
    `);
    console.log(defaults);

    return `
    export default function({ ${args} }) {
      ${defaults}
      return (
        ${render(model.vdom)}
      );
    }
    `;
  }

  function render(model) {
    let children = null;
    if (typeof model.children === 'string') {
      children = `'${model.children}'`;
    } else {
      children = model.children.map(child => {
        if (typeof child === 'string') {
          return `'${child}'`;
        } else {
          if (child.attrs['c-for']) {
            const repeater = child.attrs['c-for'].value || child.attrs['c-for'].default;
            const bindings = child.attrs['c-for'].cforitr;
            delete child.attrs['c-for'];
            return `...${repeater}.map((${bindings}) => ${render(child)})`;
          } else {
            return render(child);
          }
        }
      })
    }

    let attrs = '';
    Object.keys(model.attrs).forEach(key => {
      attrs += `${key}: ${model.attrs[key].value || model.attrs[key].default},`;
    })

    const componentRef = `'${model.renderer}'`;

    return`h(${componentRef},
      {
        ${attrs}
      },
      [
        ${children}
      ]
    )
    `;
  }

  return codegen;
})();
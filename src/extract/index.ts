/*
 * @Description: 
 * @version: 
 * @Author: 
 * @Date: 2024-04-14 21:50:48
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2024-04-15 00:56:32
 */
import path from 'path'
import fs from 'fs'
import babel from '@babel/core'
// import template from '@babel/template'
import traverse from '@babel/traverse'
// import t from '@babel/types'
// const projectRoot = process.cwd()
// const bb = path.join(projectRoot, './test/index.tsx');
// const FilePath_ToTranslate = './locale/toTranslated.ts'
const Reg_Chinese = /[^\x00-\xff]/ // 包括全角标点符号 ['注意啦，安全！', '是个']
const isChinese = (str: string) => {
    return Reg_Chinese.test(str)
}
const fileTypeList = ['.tsx', '.ts']
// let flag_extract = false
const Set_ToTranslate = new Set()

const astTraverse = (filePath: string) => {
    const {ast} = babel.transformFileSync(filePath, {
      sourceType: 'module',
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
      ast: true,
    })
    traverse(ast, {
      StringLiteral(path) {
        const { node, parentPath } = path
        if (isChinese(node.value)) {
            const translated = parentPath?.node?.type === 'CallExpression' && parentPath.node.callee.name === FuncName
            if (translated) {
                return
            }
            if (Set_ToTranslate.has(node.value)) {
                return
            }
            Set_ToTranslate.add(node.value)
        }
      },
      JSXText(path) {
        const {node} = path
        if (isChinese(node.value)) {
            if (!Set_ToTranslate.has(node.value)) {
                Set_ToTranslate.add(node.value)
            }
        }
      },
      TemplateLiteral(path) {
        const { quasis } = path.node
            quasis.forEach((node) => {
              const { value: { raw } } = node
              if (isChinese(raw)) {
                console.log(raw)
                if (isChinese(raw)) {
                    if (!Set_ToTranslate.has(raw)) {
                        Set_ToTranslate.add(raw)
                    }
                }
              }
            })
      },
    })
  }
const dealEachFile = (filePath: string) => {
    const fileName = path.basename(filePath);
    const fileName_without_extension = path.parse(filePath).name
    const extension = path.parse(filePath).ext
    const newFileName = `${fileName_without_extension}_translated${extension}`
    
    const parentDir = path.dirname(filePath);
    const newFilePath = path.join(parentDir, newFileName);
  
    if (fileTypeList.includes(path.extname(filePath))) {
      astTraverse(filePath)
      // 写入新内容到文件
     
    }
}
async function traverseFilesInDirectory(directoryPath) {
    const stats = fs.statSync(directoryPath);
    if (stats.isFile()) {
      console.log('是一个文件');
      dealEachFile(directoryPath)
    } else {
      console.log('是一个目录');
      const files = fs.readdirSync(directoryPath);
   
      for (const childFile of files) {
        const childFilePath = path.join(directoryPath, childFile);
        traverseFilesInDirectory(childFilePath)
      }
    }
}
const traverseAllFiles = (filePath: string) => {
    traverseFilesInDirectory(filePath)
}
const writeFile = async (jsonStr_toTraslate: string, filePath: string) => {
    fs.writeFile(filePath, jsonStr_toTraslate, 'utf8', (writeErr) => {
        if (writeErr) {
          console.error(writeErr);
          return writeErr
        }
        console.log('文件内容已修改。');
        return true
      });
}
const extractChinese = () => {
    // const filePath = path.join(__dirname, FilePath_ToTranslate)
    const projectRoot = process.cwd()
    const filePath = path.join(projectRoot, './test/index.tsx');
    traverseAllFiles(filePath)
    const jsonStr_toTraslate = JSON.stringify(Array.from(Set_ToTranslate))
    const destinateFileName = new Date().getTime()
    const destinateFilePath = path.join(projectRoot, `./src/locale/toTranslate/${destinateFileName}`);

    writeFile(jsonStr_toTraslate, destinateFilePath)
    // 检查文件是否存在于给定路径
    // if (fs.existsSync(filePath)) {
    //   console.log('文件存在');
    //   if (!flag_extract) {
    //     flag_extract = true
    //     const fileContent = fs.readFileSync(filePath, 'utf8');
    //     // 编译文件
    //     const result = ts.transpileModule(fileContent, {
    //       compilerOptions: {
    //         module: ts.ModuleKind.CommonJS
    //       }
    //     });
    //     console.log('---11---', result)
    //   } else if (!Set_ToTranslate.has(value)) {
    //     Set_ToTranslate.add(value)
    //     }
    // } else {
    //   console.error('文件不存在');
    //   const newObj = {
    //     [value]: ''
    //   }
    //   fs.writeFile(filePath, `export ${  JSON.stringify(newObj)}`, (err) => {
    //     if (err) {
    //       console.error('An error occurred:', err);
    //       return;
    //     }
    //     console.log('File created and content written!');
  
    //   });
    // }
  
  
}
export default extractChinese


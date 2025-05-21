"use server";

const util = require('util');
const fs2 = require('fs').promises;
const exec = util.promisify(require('child_process').exec);


export async function strawbCmd(data:{cmd:string, shiplist?:string, val?:string}) {
  if (data.cmd == 'ValueTotal') {
    let fileData = data.shiplist;
    await fs2.writeFile('test.json', fileData);
  }
  await fs2.writeFile("argument.txt", (data.val??"").toString())
  try {
    const out:{stdout:string} = await exec(`python3 src/shiplist/shiplist.py ${data.cmd}`);
    
    let logs = await fs2.readFile("src/shiplist/output.txt");
    console.log(logs.toString());
    return {status:"SUCCESS", data:{output:out.stdout}};
  } catch (e) {
    console.log(e);
    return {status:"ERROR", data:{output:"Error, see console"}}
  }
}
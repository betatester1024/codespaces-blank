"use server";

const util = require('util');
const fs2 = require('fs').promises;
const exec = util.promisify(require('child_process').exec);
import { createClient } from '@/lib/connectdb';
import { cookies } from 'next/headers'

export async function strawbCmd(data:{cmd:string, shiplist?:string, val?:string}) {
  // const cookieStore = await cookies()
  // const supabase = createClient(cookieStore);

  // let { data: shipsaves, error } = await supabase.from('shipsaves').select('value');
  // console.log("saves", shipsaves, error);
  if (data.cmd == 'ValueTotal') {
    let fileData = data.shiplist;
    await fs2.writeFile('/tmp/test.json', fileData);
  }
  await fs2.writeFile("/tmp/argument.txt", (data.val??"").toString())
  try {
    const out:{stdout:string} = await exec(`python src/shiplist/shiplist.py ${data.cmd}`);
    
    let logs = await fs2.readFile("/tmp/output.txt");
    console.log(logs.toString());
    return {status:"SUCCESS", data:{output:out.stdout}};
  } catch (e) {
    console.log(e);
    return {status:"ERROR", data:{output:"Error, see console"}}
  }
}
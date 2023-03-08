import {readFileSync} from "fs";

test("prova", () => {
  const json = readFileSync("config.json", 'utf8')
  console.log(JSON.parse(json))
})
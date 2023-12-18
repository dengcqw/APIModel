const {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
} = require('quicktype-core');

// json to code
export async function quicktypeJSON(targetLanguage: string, typeName: string, jsonString: string) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage);

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return await quicktype({
    inputData,
    lang: targetLanguage,
  });
}

// schema to code
export async function quicktypeJSONSchema(targetLanguage: string, typeName: string, jsonSchemaString: string, leadingComments: string[]) {
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());

  // We could add multiple schemas for multiple types,
  // but here we're just making one type from JSON schema.
  await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

  const inputData = new InputData();
  inputData.addInput(schemaInput);

  var rendererOptions = {}
  if (targetLanguage == "swift") {
    rendererOptions = {
      "just-types":"true",
      "density": "normal",
      "initializers": "false",
      "coding-keys": "false",
      "struct-or-class": "class",
      "mutable-properties": "true",
      "use-default-value": "true",
    }
  } else if (targetLanguage == 'typescript') {
    rendererOptions = {
      "just-types":"true",
      "raw-type": "any",
      "acronym-style": 'original'
    }
  }

  return await quicktype({
    inputData,
    lang: targetLanguage,
    inferDateTimes: false,
    inferIntegerStrings: false,
    inferBooleanStrings: false,
    leadingComments,
    rendererOptions
  });
}

/*
async function main() {
  const { lines: swiftPerson } = await quicktypeJSON(
    "swift",
    "Person",
    "jsonString"
  );
  console.log(swiftPerson.join("\n"));

  const { lines: pythonPerson } = await quicktypeJSONSchema(
    "python",
    "Person",
    "jsonSchemaString"
  );
  console.log(pythonPerson.join("\n"));
}
*/

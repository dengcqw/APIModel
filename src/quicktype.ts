import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
  JSONSchemaInput,
  FetchingJSONSchemaStore,
  SerializedRenderResult
} from 'quicktype-core'

// json to code
export async function quicktypeJSON(
  targetLanguage: string,
  typeName: string,
  jsonString: string
): Promise<SerializedRenderResult> {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage)

  // We could add multiple samples for the same desired
  // type, or many sources for other types. Here we're
  // just making one type from one piece of sample JSON.
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString]
  })

  const inputData = new InputData()
  inputData.addInput(jsonInput)

  return quicktype({
    inputData,
    lang: targetLanguage
  })
}

// schema to code
export async function quicktypeJSONSchema(
  targetLanguage: string,
  typeName: string,
  jsonSchemaString: string,
  leadingComments: string[]
): Promise<SerializedRenderResult> {
  //console.log('---->jsonSchemaString', jsonSchemaString)
  const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore())

  // We could add multiple schemas for multiple types,
  // but here we're just making one type from JSON schema.
  await schemaInput.addSource({ name: typeName, schema: jsonSchemaString })

  const inputData = new InputData()
  inputData.addInput(schemaInput)

  let rendererOptions = {}
  switch (targetLanguage) {
  case 'swift':
    rendererOptions = {
      'just-types': 'true',
      density: 'normal',
      initializers: 'false',
      'coding-keys': 'false',
      'struct-or-class': 'class',
      'mutable-properties': 'true',
      'use-default-value': 'true'
    }
    break
  case 'typescript':
    rendererOptions = {
      'just-types': 'true',
      'raw-type': 'any',
      'acronym-style': 'original'
    }
    break
  case 'dart':
    rendererOptions = {
      'just-types': 'false',
      'raw-type': 'dynamic',
      'acronym-style': 'original',
      'null-safety': 'true',
      'coders-in-class': 'true',
      'required-props': 'false'
    }
    break
  }

  return quicktype({
    inputData,
    lang: targetLanguage,
    inferDateTimes: false,
    inferIntegerStrings: false,
    inferBooleanStrings: false,
    leadingComments,
    rendererOptions
  })
}

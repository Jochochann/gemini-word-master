const modules = import.meta.glob('./unit*.ts')

export async function loadUnit(number: number): Promise<Record<string, unknown>> {
  const key = `./unit${number}.ts`
  if (!modules[key]) {
    throw new Error(`Unit ${number} のデータファイルが見つかりません (${key})`)
  }
  const mod = await modules[key]() as Record<string, unknown>
  return Object.values(mod)[0] as Record<string, unknown>
}

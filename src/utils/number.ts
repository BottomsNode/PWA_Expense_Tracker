const safeNumber = (value: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0

const mergeOptions = (
    base: Intl.NumberFormatOptions,
    override?: Intl.NumberFormatOptions
) => ({
    ...base,
    ...(override ?? {}),
})

export const formatIndianNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
) => {
    const safeValue = safeNumber(value)
    const formatOptions = mergeOptions(
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        },
        options
    )

    return safeValue.toLocaleString("en-IN", formatOptions)
}

export const formatIndianCurrency = (
    value: number,
    options?: Intl.NumberFormatOptions
) => {
    const formatOptions = mergeOptions(
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
        options
    )

    return formatIndianNumber(value, formatOptions)
}


/**
 * Built-in formatters for CrudList columns.
 * Use in header: formatter: 'titleCase' or formatter: crudListFormatters.titleCase
 */
export const crudListFormatters = {
  titleCase(value) {
    if (value == null || String(value).trim() === '') return value ?? 'N/A'
    return String(value)
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  },
}

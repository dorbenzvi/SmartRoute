export function fromAddressValidator(routeName) {
  if (!routeName || routeName.length <= 0)
    return " From Address can't be empty."
  return ''
}

export function customerAddressValidator(routeName) {
  if (!routeName || routeName.length <= 0)
    return " Customer Address can't be empty."
  return ''
}

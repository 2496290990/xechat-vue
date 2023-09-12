export function isBlank(str) {
    return str == '' || str == null || str == undefined
}

export function isNotBlank(str) {
    return !isBlank(str)
}
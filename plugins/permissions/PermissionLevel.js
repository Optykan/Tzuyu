// its like an enum but i didnt want to import enums

var levels = {
  USER: 1,
  MOD: 2,
  ADMIN: 3,
  DEFAULT: 1
}

var PermissionLevel = new Proxy(levels, {
  get: function (target, name) {
    return target[name]
  },
  set: function (target, name, value) {
    target[name] = value
  }
})

module.exports = PermissionLevel

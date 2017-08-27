//its like an enum but i didnt want to import enums

var levels = {
	PERM_USER: 1,
	PERM_MOD: 2,
	PERM_ADMIN: 3,

	get(){

	}
}

var PermissionLevel = new Proxy(levels, {
	get: function (target, name){
		return target[name]
	},
	set: function (target, name, value){
		target[name] = value
	}
})

module.exports = PermissionLevel
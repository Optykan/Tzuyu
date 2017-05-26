const Plugin = require('../Plugin')

class DM extends Plugin {
  constructor () {
    super()
    this.title = 'Dungeon Master'
    this.desc = 'A plugin for your Dungeons and Dragons needs'
    this.help = 'Woops! It looks like what you searched for is missing. Check back again later!'
    this.enabled = true
    this.lastroll = {
      sum: undefined, // the king of variables
      times: 1,
      sides: 6,
      string: 'd6'
    }
  }
  register () {
    return {
      trigger: ['roll', 'lastroll'],
      action: [this.roll, this.rollstats],
      injects: ['Tzuyu@tzuyu' , 'Tzuyu@tzuyu'],
      help: {
        roll: 'Accept a roll of format "xdn" to roll an n-sided die x times',
        lastroll: 'Display the result and statistical information of last diceroll'
      }
    }
  }

  random (lo, hi) { // return 4;
    return Math.round(Math.random() * (hi - lo) + lo)
  }

  roll (tzuyu, input) {
    let nums = /^([0-9]*?)[dD]([0-9]+$)/.exec(input)

    if (!nums) {
      return tzuyu.message('Something was wrong with that input.')
    }

  // if (!nums[1]){
  //   this.lastroll.times = 1
  // }
    this.lastroll.times = nums[1] || 1
    this.lastroll.sides = nums[2]

    if (this.lastroll.times > 9999 || this.lastroll.times < 1 || this.lastroll.sides < 1 || this.lastroll.sides > 9999) {
      // arbitrary, but will we EVER need more. Also 1-sided die mfw
      return tzuyu.message("A-ah! Your numbers... so big... T-that definitely won't fit inside me! <:heart:312888633613090828> Kyaaaaaaaa!~")
      // remindme: along with verbose mode, add hentai mode (toggleable hopefully oh god)
    }

    this.sum = 0
    this.string = input// sloppy
    for (var i = 0; i < this.lastroll.times; i++) {
      this.sum += this.random(1, this.lastroll.sides)
    }
    tzuyu.message(Math.ceil(this.sum))
  }

  rollstats (tzuyu) {
    if (this.sum === undefined) {
      throw new Error("Oops! I can't find your previous roll.")
    }
    console.log(this.sum)
    // http://www.geeksforgeeks.org/dice-throw-problem/

    let x = this.sum
    let n = this.lastroll.times
    let m = this.lastroll.sides
    console.log('x=' + x + ' n=' + n + ' m=' + m)

    var arr = [n + 1][x + 1]
    arr.fill(0)

    console.log(arr[1][x])

    for (var i = 1; i <= m && i <= x; i++) {
      arr[1][i] = 1
    }

    for (let i = 2; i <= n; i++) {
      for (let j = 1; j <= x; j++) {
        for (let k = 1; k <= m && k < j; k++) {
          arr[i][j] += (arr[i - 1][j - k] || 0)
        }
      }
    }

    console.log('Chances are ' + arr[n][x] + ' in ' + (n * m))
    this.odds = arr[n][x] / (n * m)

    let roll = {
      sum: this.sum,
      string: this.string,
      lo: this.lastroll.times,
      hi: this.hi * this.lastroll.sides,
      odds: this.odds,
      likely: 0
    }

    return roll
  }
}

module.exports = DM // more like plugin.exports haha end me)

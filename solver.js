"use strict";

Number.isNaN = Number.isNaN || function (value) {
    return value !== value; // when value is NaN, it returns true
};

const {
    prompt
} = require("promptly");

var key_re = [
    /^(\d+)$/,
    /^([\+-]\d+)$/,
    /^[\*\/]([\+-]?\d+)$/,
    /^(\d+)(=>|\.)(\d+)$/,
    /^reverse$/i,
    /^\+\/-$/,
    /^shift>$/i,
    /^<shift$/i,
    /^x\^?(\d)$/,
    /^(del|delete|<<)$/i,
    /^sum$/i,
    /^mirror$/i,
    /^\[[\+-]\](\d+)/i,
    /^(l|i)nv10$/i
];

async function main(config) { // Script By JieJiSS
    var answer = [],
        vals = [];
    var log = console.log;
    if (config) {
        var {
            init,
            goal,
            move,
            strarr,
            door
        } = config;
        var dbg_return = [];
        log = function log() {
            var str = [].slice.call(arguments).join(" ");
            dbg_return.push(str);
        };
    } else {
        var init = Number(await prompt('Initial value:')),
            goal = Number(await prompt('Target value:')),
            move = Number(await prompt('Number of steps:'));
        var strarr = (await prompt('Texts on buttons (use space to seperate):')).split(/[\s\,]+/);
        var door = await prompt('Portal (optional):', {
            retry: false,
            default: ""
        });
    }
    var positions;

    if (door) {
        positions = door.split(/\s+/);
        for (var i in positions) {
            positions[i] = Number(positions[i]); // [4, 1] from right
            if (Number.isNaN(positions[i]))
                throw TypeError("NaN got for portal.");
        }
    }
    if(Number.isNaN(move)) {
        throw TypeError("NaN got for Number of steps.");
    }
    /* ----------- */
    var keys = [];
    var ch = keys; //pointer
    var refresh = [];

    Array.prototype.strhas = function (elem) {
        if (!elem) {
            return false;
        }
        var str = elem.toString();
        for (var i in this.valueOf()) {
            if (({}).toString.call(this[i]).slice(8, -1) !== 'Object' && this.valueOf()[i].toString() === str) {
                return true;
            }
        }
        return false;
    };

    String.prototype.reverse = String.prototype.reverse || function reverse() {
        var source = this.valueOf(),
            target = [];
        for (var i = 0, l = source.length; i < l; i++) {
            target.push(source[l - i - 1]);
        }
        return target.join('');
    };

    function Key(arr, i) {
        var push = key_re[0],
            add = key_re[1],
            times = key_re[2],
            replace = key_re[3],
            reverse = key_re[4],
            convert = key_re[5],
            lshift = key_re[6],
            rshift = key_re[7],
            self = key_re[8],
            del = key_re[9],
            sum = key_re[10],
            mirror = key_re[11],
            gladd = key_re[12],
            lnv10 = key_re[13];
        //store = /^store$/i;
        var func, changeable = false;
        switch (true) {
            case push.test(arr[i]):
                func = function (num) {
                    return Number(num.toString() + arr[i].match(push)[1]);
                };
                changeable = true;
                break;
            case add.test(arr[i]):
                func = function (num) {
                    //log(arr.join(' ') + ', ' + i);
                    return num + Number(arr[i].match(add)[1]);
                };
                changeable = true;
                break;
            case times.test(arr[i]):
                func = function (num) {
                    switch (arr[i][0]) {
                        case '*':
                            return num * Number(arr[i].match(times)[1]);
                        case '/':
                            return num / Number(arr[i].match(times)[1]);
                        default:
                            throw 'invalid operator: ' + arr[i][0];
                    }
                };
                changeable = true;
                break;
            case replace.test(arr[i]):
                func = function (num) {
                    var numstr = num.toString(),
                        from = arr[i].match(replace)[1],
                        to = arr[i].match(replace)[3];
                    while (numstr.indexOf(from) !== -1) {
                        numstr = numstr.replace(from, to);
                    }
                    return Number(numstr);
                };
                break;
            case reverse.test(arr[i]):
                func = function (num) {
                    var numstr = num.toString();
                    var sym = numstr[0] === '-' ? -1 : 1;
                    if (sym === -1) numstr = numstr.slice(1);
                    return sym * Number(numstr.reverse());
                };
                break;
            case convert.test(arr[i]):
                func = function (num) {
                    return -num;
                };
                break;
            case lshift.test(arr[i]):
                func = function (num) {
                    var numstr = num.toString();
                    var sym = numstr[0] === '-' ? -1 : 1;
                    if (sym === -1) numstr = numstr.slice(1);
                    var numarr = numstr.split('');
                    numarr.unshift(numarr.pop());
                    return sym * Number(numarr.join(''));
                };
                break;
            case rshift.test(arr[i]):
                func = function (num) {
                    var numstr = num.toString();
                    var sym = numstr[0] === '-' ? -1 : 1;
                    if (sym === -1) numstr = numstr.slice(1);
                    var numarr = numstr.split('');
                    numarr.push(numarr.shift());
                    return sym * Number(numarr.join(''));
                };
                break;
            case self.test(arr[i]):
                func = function (num) {
                    return Math.pow(num, Number(arr[i].match(self)[1]));
                };
                break;
            case del.test(arr[i]):
                func = function (num) {
                    var numarr = num.toString().split('');
                    numarr.pop();
                    return Number(numarr.join('') || 0) || 0;
                };
                break;
            case sum.test(arr[i]):
                func = function (num) {
                    var sum = 0,
                        s = num.toString(),
                        n = 0,
                        sym = 1;
                    if (s[0] === '-') {
                        n = 1;
                        sym = -1;
                    }
                    for (; n < s.length; n++) {
                        sum += Number(s[n]);
                    }
                    return sym * sum;
                };
                break;
            case mirror.test(arr[i]):
                func = function (num) {
                    var s = num.toString(),
                        sym = s[0] === '-' ? -1 : 1;
                    s = sym === -1 ? s.slice(1) : s;
                    return sym * Number(s + s.reverse());
                };
                break;
            case gladd.test(arr[i]):
                func = function (num) {
                    //log(['ch:', ch]);
                    for (var o = 0; o < ch.length; o++) {
                        if (ch[o].changeable) {
                            var from = arr[o].match(/(\d+)/)[1],
                                to = arr[o].replace(from, '');
                            switch (arr[i][1]) {
                                case '+':
                                    to += Number(from) + Number(arr[i].match(gladd)[1]);
                                    break;
                                case '-':
                                    to += Number(from) - Number(arr[i].match(gladd)[1]);
                                    break;
                                default:
                                    throw 'wtf?';
                            }
                            //log(['gbl', arr, o, from, to]);
                            refresh[o] = refresh[o] || (function (i, f) {
                                return function () {
                                    arr[i] = f;
                                }
                            })(o, arr[o]); //fix multiple [+]\d bug
                            arr[o] = to;
                            ch[o] = new Key(arr, o);
                            //log(keys[o] === ch[o]);
                        }
                    }
                    return num;
                };
                break;
            case lnv10.test(arr[i]):
                func = function (num) {
                    var numstr = num.toString(),
                        returnstr = '';
                    if (numstr[0] === '-') {
                        returnstr = '-';
                        numstr = numstr.slice(1);
                    }
                    for (var b in numstr)
                        returnstr += 10 - (Number(numstr[b]) || 10); // 10 -> 0
                    return Number(returnstr);
                };
                break;
                //case store.test(arr[i]):
            default:
                throw new TypeError('unknown key:' + arr[i]);
        }
        return {
            calc: func,
            getLiteral: function () {
                return arr[i]
            },
            changeable: changeable
        };
    }

    function calcDoor(num) {
        if (isNaN(num))
            return NaN;
        if (door === '' || Math.floor(num) !== num)
            return num; //implicit fail
        var numstr = num.toString();
        if (numstr.length < positions[0])
            return num;
        if (numstr.length === positions[0] && numstr[0] === '-')
            return num;
        do {
            var index = numstr.length - positions[0],
                send = Number(numstr[index]),
                beforesend = Number(numstr.slice(0, index)),
                tobeadd = Number(beforesend + numstr.slice(index + 1, numstr.length - positions[1] + 1)),
                suffix = numstr.slice(numstr.length - positions[1] + 1);
            if (numstr[index] === '-')
                break;
            numstr = (tobeadd + send) + suffix;
        } while (numstr.length >= positions[0])
        return Number(numstr);
    }

    function getMagicNumber(m) {
        var r = '';
        for (var i = 0; i < m; i++) {
            r += '1';
        }
        return Number(r);
    }

    function getStartNumber(m) {
        return Math.pow(10, m - 1);
    }

    for (var j = 0; j < strarr.length; j++) {
        var button = new Key(strarr, j);
        keys.push(button);
    }

    var backup = keys.slice(); //copy
    var total = keys.length,
        now = getStartNumber(move);
    total *= getMagicNumber(move);
    //log('total: ' + total);

    var val,
        finished,
        step = [];

    while (now <= total) {
        val = init;
        keys = backup.slice();
        for (var z in keys)
            refresh[z] && refresh[z]();
        for (var k = 1; k <= move; k++) {
            var l = Number(now.toString()[k - 1]) - 1;
            if (l < 0) {
                continue;
            }
            var key = keys[l];
            step.push(key.getLiteral());
            val = calcDoor(key.calc(val));
            vals.push(val);
            if (val === goal) {
                //log('find an answer');
                break;
            } else {
                if (val.toString().length > 6 || Math.floor(val) !== val) {
                    break;
                }
                //log(step.join(','), val, now);
            }
        }
        //log(['step', step]);
        if (val === goal && !answer.strhas(step)) {
            answer.push(step.slice());
            log('Solution:', step.join(", ") + '; process:', vals.join("->"));
            finished = false;
        }
        if (isNaN(val)) {
            log('NaN: ' + step);
        }
        step = [];
        vals = [];
        now++;
        while (now.toString().indexOf(keys.length + 1) !== -1) { //out of range
            now += Math.pow(10, now.toString().length - now.toString().indexOf(keys.length + 1)) - (keys.length + 1) * Math.pow(10, now.toString().length - now.toString().indexOf(keys.length + 1) - 1); //10004 to 10010
            //log('add now to ' + now);
        }
    }
    if (!answer.length)
        log('No solution found.');
    if (config) {
        return dbg_return;
    }
    return answer.length;
}

module.exports = {
    main,
    key_re
};

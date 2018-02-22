"use strict";

const assert = require("assert");
const {
    main,
    key_re
} = require("./solver");

(async () => {
    let result1 = await main({
        init: 0,
        goal: 10,
        move: 4,
        strarr: ["+5", "2", "reverse", "<shift"],
        door: ""
    });
    assert.strictEqual(result1.sort().toString(), ['Solution: +5, +5; process: 5->10',
        'Solution: +5, reverse, +5; process: 5->5->10',
        'Solution: +5, <shift, +5; process: 5->5->10',
        'Solution: +5, reverse, reverse, +5; process: 5->5->5->10',
        'Solution: +5, reverse, <shift, +5; process: 5->5->5->10',
        'Solution: +5, <shift, reverse, +5; process: 5->5->5->10',
        'Solution: +5, <shift, <shift, +5; process: 5->5->5->10',
        'Solution: reverse, +5, +5; process: 0->5->10',
        'Solution: reverse, +5, reverse, +5; process: 0->5->5->10',
        'Solution: reverse, +5, <shift, +5; process: 0->5->5->10',
        'Solution: reverse, reverse, +5, +5; process: 0->0->5->10',
        'Solution: reverse, <shift, +5, +5; process: 0->0->5->10',
        'Solution: <shift, +5, +5; process: 0->5->10',
        'Solution: <shift, +5, reverse, +5; process: 0->5->5->10',
        'Solution: <shift, +5, <shift, +5; process: 0->5->5->10',
        'Solution: <shift, reverse, +5, +5; process: 0->0->5->10',
        'Solution: <shift, <shift, +5, +5; process: 0->0->5->10'
    ].sort().toString(), "× failed");
    let result2 = await main({
        init: 0,
        goal: -10,
        move: 3,
        strarr: ["3"],
        door: ""
    });
    assert.strictEqual(result2.toString(), "No solution found.", "× expecting `No solution found.`");
    main({
        init: 0,
        goal: 10,
        move: 2,
        strarr: ["WTF???"],
        door: ""
    }).then(() => {
        assert.fail("× this should throw an Error");
    }).catch(e => {
        assert.ok(e instanceof TypeError, "× this should throw a TypeError");
    });
    console.log("Test finished.");
})().catch(e => {
    console.error(e);
});

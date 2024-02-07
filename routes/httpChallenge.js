const express = require('express');
const fs = require('node:fs');

const router = express.Router();

router.get(
    '/.well-known/acme-challenge/C-vZGv3LynJUWBXKND_xNO18r-BRnNa8Icd2U640eOw',
    (req, res) => {
        return res.send(
            fs.readFileSync(
                './.well-known/acme-challenge/C-vZGv3LynJUWBXKND_xNO18r-BRnNa8Icd2U640eOw'
            )
        );
    }
);

module.exports = router;
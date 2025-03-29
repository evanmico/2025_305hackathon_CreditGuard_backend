module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        'eslint:recommended',
        'plugin:eslint-plugin-sql'
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": ['sql'],
    "rules": {
        "sql/format": [
            2,
            {
              "ignoreExpressions": false,
              "ignoreInline": true,
              "ignoreTagless": true
            }
          ],
          "sql/no-unsafe-query": [
            2,
            {
              "allowLiteral": true,
              "sqlTag":"SQL"
            }
          ]
    }
}
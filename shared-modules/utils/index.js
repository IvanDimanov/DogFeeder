/**
 * Common set of general purpose JS functions.
 * They will be directly exported if 'module.exports' is been provided as Node.js or
 * will overwrite 'window.utils' as object properties
 */
(function () {
  'use strict'

  /* Short-hand debug function */
  function log () {
    return console.log.apply(console, arguments)
  }

  /**
   * Intended to be used as 'console.log' method but in the browsers' page.
   * Will print every incoming arguments in using the 'document.write()' function
   *
   * @dependences
   *   each()
   *   toString()
   *
   * @example
   *   documentLog()                               Prints=>  '<br />'
   *   documentLog(17)                             Prints=>  '17 <br />'
   *   documentLog(typeof 17, 17)                  Prints=>  'number 17 <br />'
   *   documentLog('a', {"key":"val"}, undefined)  Prints=>  'a {"key":"val"}  <br />'
   */
  function documentLog () {
    /* Secure common browser 'document' object */
    if (
      typeof document !== 'object' ||
      typeof document.body !== 'object'
    ) return

    var text = ''
    each(arguments, function (argument) {
      text += toString(argument) + ' '
    })

    document.body.innerHTML += '<pre>' + text + '</pre>'
  }

  /* Remove spaces from both string ends */
  function trim (str) {
    return typeof str === 'string' ? str.replace(/^\s+|\s+$/g, '') : ''
  }

  /**
   * Takes a string of words and removes all white spaces between, before and after the words,
   *
   * @param  {String} str Presumably long string of words
   * @return {String}     Same as the income str but trimmed + with no long white spaces between each word
   *
   * @example
   *   normalize('   x x    x x') => "x x x x"
   *   normalize('x x')           => "x x"
   */
  function normalize (str) {
    return ((str + '').match(/\S+/g) || []).join(' ')
  }

  /**
   * Convert any JS data type to secured {String} type
   * NOTE: 'toString()' is a received function for some browsers
   *
   * @dependences
   *   jsonStringifySafe()
   *
   * @param  {Mixed}  message  Any type of var that need a String convert
   * @return {String}          Secured String format or an empty string ('')
   */
  function toString (message) {
    switch (typeof message) {
      case 'string':
        return message

      case 'boolean':
      case 'number':
        return message + ''

      case 'object':
        if (message instanceof Error) return message.message
        if (message instanceof RegExp) return message.toString()

        return jsonStringifySafe(message)

      case 'function':
        return message.toString()

      default:
        return ''
    }
  }

  /**
   * Check if the income var is a real number (integer, octal, or float).
   *
   * @param  {Mixed}   number  The variable that need to be checked if it's a number var
   * @return {Boolean}         Return a true if the income var is a number (else false)
   */
  function isNumber (number) {
    return !isNaN(parseFloat(number)) && isFinite(number)
  }

  /**
   * Check if the incoming 'floatNumber' is a floating point number
   *
   * @dependences
   *     isNumber()
   */
  function isFloat (floatNumber) {
    return isNumber(floatNumber) && (floatNumber % 1)
  }

  /**
   * Check if the incoming 'int' is an Integer number
   *
   * @dependences
   *     isNumber()
   */
  function isInteger (int) {
    return isNumber(int) && !(int % 1)
  }

  /**
   * Extend an integer number by adding '0' in front.
   *
   * @author Ivan Dimanov
   * @param  n      An integer number to be extended
   * @param  digits Total number of final digits
   *
   * @depends
   *     isNumber()
   *
   * @example
   *   setDigits( 7  , 3)    => '007'
   *   setDigits('7' , 3)    => '007'
   *   setDigits('70', 3)    => '070'
   *   setDigits('a7', 3)    => 'a7'
   *   setDigits( 7  , 'a3') => 7
   *
   */
  function setDigits (n, digets) {
    digets *= 1
    var diff = digets - (n + '').length

    if (isNumber(n) && isNumber(digets) && diff > 0) {
      while (diff--) n = '0' + n
    }

    return n
  }

  /**
   * Set an incoming number between 2 number values
   *
   * @param  {Number}  num      The number we want to get in between
   * @param  {Number}  limit1  1st number limit
   * @param  {Number}  limit2  2nd number limit
   * @return {Number}           Clamped number or if any errors occurred, the same incoming num
   */
  function clampNumber (num, limit1, limit2) {
    /* Echo the incoming test number if no valid input is been provided */
    if (!isNumber(num) ||
        !isNumber(limit1) ||
        !isNumber(limit2)
    ) return num

    /* Take maximum and minimum values from the incoming limits */
    var clamped = num
    var max = Math.max(limit1, limit2)
    var min = Math.min(limit1, limit2)

    /* Clamp the incoming number between its value limits */
    if (num > max) clamped = max
    if (num < min) clamped = min

    return clamped
  }

  /**
   * Takes any Real number and tries to round it till the new point position.
   * @example
   *     roundAfterPoint( 7.119511 ,  3 )  =>  7.12
   *     roundAfterPoint( 7.119411 ,  3 )  =>  7.119
   *     roundAfterPoint('7.119411',  3 )  =>  7.119
   *     roundAfterPoint( 7.119411 , '3')  =>  7.119
   *     roundAfterPoint('a.119411',  3 )  =>  'a.119411'
   *     roundAfterPoint( 7.119411 , -3 )  =>  7.119411
   *     roundAfterPoint( 7.119411 , 'a')  =>  7.119411
   */
  function roundAfterPoint (_number, _precession) {
    var number = _number * 1
    var precession = _precession * 1

    /* Validate number input */
    if (isNaN(number) || !number) return _number
    if (isNaN(precession) || precession < 0) return _number

    /* Calculate the exact position from where we should make a round */
    var precessionCoeff = 1
    while (precession--) precessionCoeff *= 10

    return Math.round(number * precessionCoeff) / precessionCoeff
  }

  /**
   * Will search for the Greatest Common Divisor for any given 2 numbers
   * http://en.wikipedia.org/wiki/Greatest_common_divisor
   *
   * @dependencies
   *   isNumber
   *
   * @example
   *   greatestCommonDivisor( 8    , 12 )  =>  4
   *   greatestCommonDivisor( 0.750, 10 )  =>  0.25
   */
  function greatestCommonDivisor (number1, number2) {
    /* Number types check-in */
    if (!isNumber(number1) || !isNumber(number2)) return NaN

    /* Keep dividing till we find the exact divisor number as 'number1' */
    var tempNumber1
    while (number2) {
      tempNumber1 = number1
      number1 = number2
      number2 = tempNumber1 % number2
    }

    return number1
  }

  /**
   * Convert any floating point number to a fractional string
   *
   * @dependencies
   *   isNumber
   *   isInteger
   *   isFloat
   *
   * @example
   *   floatToFraction( 0.750 )  =>  "3/4"
   *   floatToFraction( 15.12 )  =>  "378/25"
   */
  function floatToFraction (floatNumber) {
    /* Floating number types check */
    if (!isNumber(floatNumber)) return NaN

    /* "Easy" integer cases check */
    if (isInteger(floatNumber)) return floatNumber + '/1'

    /*
      Perform the calculation using only positive numbers
      so keeping the 'floatNumber' sign is important
    */
    var sign = floatNumber < 0 ? '-' : ''
    floatNumber = Math.abs(floatNumber)

    var primalNumerator
    var primalDenominator = 1

    /* Convert from floating to 2 integer fractional numbers */
    while (isFloat(floatNumber)) {
      floatNumber *= 10
      primalNumerator = Math.floor(floatNumber)
      primalDenominator *= 10
    }

    /* Find the GCD for both integer fractions */
    var gcd = greatestCommonDivisor(primalNumerator, primalDenominator)

    /* Give the simplest fraction possible */
    return sign + primalNumerator / gcd + '/' + primalDenominator / gcd
  }

  /**
   * Will return the power of the 'numberInPower' for a given 'baseNumber' using custom logarithm.
   * More info at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log => 'getBaseLog(x, y)'
   *
   * @dependences:
   *     isNumber
   *
   * @param  {Number} baseNumber
   * @param  {Number} numberInPower
   * @return {Mixed}                 Will return either the power as {Number} or 'NaN' for any invalid input.
   *
   * @examples
   *     getPowerLog( 2 , -1)  =>  NaN
   *     getPowerLog('3','a')  =>  NaN
   *     getPowerLog( 2 ,  0)  =>  -Infinity
   *     getPowerLog( 2 ,  8)  =>  3
   *     getPowerLog( 2 , 16)  =>  4
   *     getPowerLog( 3 ,  9)  =>  2
   *     getPowerLog('3',  9)  =>  2
   */
  function getPowerLog (baseNumber, numberInPower) {
    if (!isNumber(baseNumber) || !isNumber(numberInPower)) return NaN
    return Math.log(numberInPower) / Math.log(baseNumber)
  }

  /*
    Will convert any number 'convertingNumber' knowing its base as 'baseFrom' and
    will return its 'convertedNumber' to the requested base 'baseTo'.

    @dependencies:
      isInteger

    @examples:
      convertNumberBase()              =>  NaN
      convertNumberBase(  10,  0, 16)  =>  NaN
      convertNumberBase(  10, -2, 16)  =>  NaN
      convertNumberBase('FF', 10, 16)  =>  NaN
      convertNumberBase('FF', 16, 16)  =>  FF
      convertNumberBase(   0,  2, 10)  =>  0
      convertNumberBase(1100,  2, 10)  =>  12
      convertNumberBase(  10, 10, 16)  =>  A
      convertNumberBase( -10, 10, 16)  =>  -A
      convertNumberBase('FF', 16, 10)  =>  255

    Special thanks to Dr Zhihua Lai
    http://rot47.net/_js/convert.js
  */
  function convertNumberBase (convertingNumber, baseFrom, baseTo) {
    /* Complete converting alphabet */
    var MAX_BASE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    /* Validate converting bases */
    if (!isInteger(baseFrom) || baseFrom <= 0) return NaN
    if (!isInteger(baseTo) || baseTo <= 0) return NaN

    /* Detect common cases */
    if (!convertingNumber) return 0
    if (baseFrom === baseTo) return convertingNumber

    baseFrom *= 1
    baseTo *= 1

    /* Will help presenting negative numbers */
    var numberSign = ''
    if (convertingNumber < 0) {
      numberSign = '-'
      convertingNumber = Math.abs(convertingNumber)
    }

    var convertingNumberChars = convertingNumber + ''

    /* Out of range basing */
    if (baseFrom > MAX_BASE_CHARS.length) return NaN
    if (baseTo > MAX_BASE_CHARS.length) return NaN

    /* Create sub-alphabets for both converting bases */
    var baseFromChars = MAX_BASE_CHARS.slice(0, baseFrom)
    var baseToChars = MAX_BASE_CHARS.slice(0, baseTo)

    var baseFromCharsLength = baseFromChars.length
    var baseToCharsLength = baseToChars.length

    /* Convert the 'convertingNumber' characters into respective integer value */
    var convertingNumberInt = 0
    for (var i = 0; i < convertingNumberChars.length; ++i) {
      convertingNumberInt = convertingNumberInt * baseFromCharsLength + baseFromChars.indexOf(convertingNumberChars.charAt(i))
    }

    /* Base conversion check */
    if (convertingNumberInt < 0) return NaN

    /* Keep chunking off till we convert all 'convertingNumberInt' into 'convertedNumber' */
    var baseToChar = convertingNumberInt % baseToCharsLength
    var convertedNumber = baseToChars.charAt(baseToChar)
    var baseFromCharsLeft = Math.floor(convertingNumberInt / baseToCharsLength)

    while (baseFromCharsLeft) {
      baseToChar = baseFromCharsLeft % baseToCharsLength
      baseFromCharsLeft = Math.floor(baseFromCharsLeft / baseToCharsLength)
      convertedNumber = baseToChars.charAt(baseToChar) + convertedNumber
    }

    return numberSign + convertedNumber
  }

  /**
   * Will return a pseudo-random number in a given range of the first two arguments.
   * If some of the arguments are missing, we'll fallback to default range limits or
   * to default 'Math.random()' function
   *
   * @dependencies
   *   isNumber()
   *   roundAfterPoint()
   *
   * @param  {Number} limit1         [Optional] Range numbers limitation
   * @param  {Number} limit2         [Optional] Range numbers limitation
   * @param  {Number} floatPrecision [Optional] Will tell how precise the returned number need to be, e.g. when floatPrecision=2, answer may be 7.45, floatPrecision=3, answer may be 7.453
   * @return {Number}
   *
   * @examples
   *   getRandomNumber()           =>  0.4821015023626387  // default Math.random()
   *   getRandomNumber(10)         =>  1983785338          // default upper limit
   *   getRandomNumber(10, 15)     =>  12                  // Random number with floating point of 0
   *   getRandomNumber(10, 15, 3)  =>  14.206              // Random number with floating point of 3
   *
   *   getRandomNumber('a')           =>  3906844682       // default upper & lower limits
   *   getRandomNumber('a', 17)       =>  -2537090446      // default lower limits
   *   getRandomNumber('a', 17, 'a')  =>  -3632881518      // default lower & floating limits
   */
  function getRandomNumber (limit1, limit2, floatPrecision) {
    /* Check if we need to round in a specific precision */
    if (!isNumber(floatPrecision) || floatPrecision < 0) floatPrecision = 0

    /* Fallback to default Math function of no arguments were supported */
    if (limit1 === limit2 &&
        !floatPrecision
    ) {
      return isNumber(limit1) ? limit1 : Math.random()
    }

    /* Set default range limitations */
    var maxRange = Math.pow(2, 32) - 1
    if (!isNumber(limit1)) limit1 = -maxRange
    if (!isNumber(limit2)) limit2 = maxRange

    var limitLower = Math.min(limit1, limit2)
    var limitUpper = Math.max(limit1, limit2)
    var limitFloat = Math.pow(10, floatPrecision)

    limitLower = roundAfterPoint(limitLower, floatPrecision)
    limitUpper = roundAfterPoint(limitUpper, floatPrecision)

    var randomNumber = Math.random()
    randomNumber *= limitUpper - limitLower + 1 * Math.pow(0.1, floatPrecision)
    randomNumber = Math.floor(randomNumber * limitFloat) / limitFloat
    randomNumber += limitLower
    randomNumber = roundAfterPoint(randomNumber, floatPrecision)

    return randomNumber
  }

  /*
    Random HEX color value.
    INFO: http://www.paulirish.com/2009/random-hex-color-code-snippets
  */
  function getRandomColor () {
    return '#' + Math.floor(Math.random() * 16777215).toString(16)
  }

  /* Always return an Array with a structure as maximum as close to the incoming obj structure */
  function toArray (obj) {
    switch (typeof obj) {
      case 'boolean':
      case 'string':
      case 'number':
        return [obj]

      case 'object':
        return obj instanceof Array ? obj : [obj]

      default:
        return []
    }
  }

  /* Gives the total number of private object keys */
  function objectLength (obj) {
    return (typeof obj === 'object' && obj != null) ? Object.keys(obj).length : 0
  }

  /*
    Instead of throwing an error for every invalid JSON string
    this function will safely return a JSON object, or 'undefined'
  */
  function jsonParseSafe () {
    try {
      return JSON.parse.apply(JSON, arguments)
    } catch (error) {
      return undefined
    }
  }

  /*
    Instead of throwing an error for every invalid JSON object
    this function will safely return a JSON string, or 'undefined'
  */
  function jsonStringifySafe () {
    try {
      return JSON.stringify.apply(JSON, arguments)
    } catch (error) {
      return undefined
    }
  }

  /**
   * Recursively loop over all Objects in 'obj' and lock all of them using the 'Object.freeze'.
   * Circular object relations are checked using the 'jsonStringifySafe' function.
   *
   * @dependences
   *     each()
   *     jsonStringifySafe()
   */
  function recursiveFreezeObject (obj) {
    /* Secure a valid non-circular JSON object */
    if (typeof obj !== 'object' ||
        !jsonStringifySafe(obj)
    ) return

    each(obj, function (value, key) {
      recursiveFreezeObject(obj[ key ])
    })

    return Object.freeze(obj)
  }

  /*
    'Object.prototype.toString' will do all safe checks for us and give the 'variable' constructor.
    Example:
      getInstance()                =>  "Undefined"
      getInstance(  undefined   )  =>  "Undefined"
      getInstance(     null     )  =>  "Null"
      getInstance(     true     )  =>  "Boolean"
      getInstance(      ''      )  =>  "String"
      getInstance(       1      )  =>  "Number"
      getInstance(      {}      )  =>  "Object"
      getInstance(      []      )  =>  "Array"
      getInstance(    Error     )  =>  "Function"
      getInstance( new Error()  )  =>  "Error"
      getInstance( new RegExp() )  =>  "RegExp"
  */
  function getInstance (variable) {
    return Object.prototype.toString.call(variable).replace('[object ', '').replace(']', '')
  }

  /**
   * Reduce the income string to a limit of chars
   * Examples:
   *    clampString('abcdefg',  1)  => "."
   *    clampString('abcdefg',  4)  => "a..."
   *    clampString('abcdefg',  7)  => "abcdefg"
   *    clampString('abcdefg', 20)  => "abcdefg"
   *    clampString('abcdefg', -1)  => "abcdefg"
   *    clampString('abcdefg', 'a') => "abcdefg"
   */
  function clampString (str, limit) {
    var clamped = ''

    /* Validate input */
    if (typeof str !== 'string') return str
    if (!isInteger(limit)) return str

    /* Check for valid char limits */
    if (limit > 0 && str.length > limit) {
      /* Char symbols that will represent that the string is been clamped */
      var endChars = '...'
      var endCharsLength = endChars.length

      /* Check if our char presenters are in the maximum chars limit */
      if (endCharsLength < limit) {
        /* Returned a part from the main income string and ending representative chars */
        clamped = str.substr(0, limit - endCharsLength) + endChars
      } else {
        /* Return a portion of our representative chars */
        clamped = endChars.substr(0, limit)
      }
    } else {
      /* Return the same string if invalid limit chars is specified */
      clamped = str
    }

    /* Return the clamped formated string */
    return clamped
  }

  /**
   * Will take common case "Camel" style and return "Underscored" style string
   * @example
   *   camelCaseToUnderscore('myClassHTTP_Var1'   )  =>  "my_class_http_var1"
   *   camelCaseToUnderscore('__ClassHTTP_Var1'   )  =>  "class_http_var1"
   *   camelCaseToUnderscore('MyClass+-/*HTTPVar1')  =>  "my_class_+-/*_httpvar1"
   *   camelCaseToUnderscore({})  =>  ""
   *   camelCaseToUnderscore()    =>  ""
   */
  function camelCaseToUnderscore (camelCaseString) {
    if (typeof camelCaseString !== 'string') return ''

    var underscore = camelCaseString.replace(/[ ]+/g, '_')

    underscore = underscore.replace(/([A-Z]+)([a-z0-9]*)/g, function (match) {
      return '_' + match.toLowerCase() + '_'
    })

    underscore = underscore.replace(/[_]{2,}/g, '_')

    underscore = underscore.replace(/^[_]+/, '')
    underscore = underscore.replace(/[_]+$/, '')

    return underscore
  }

  /**
   * Set as caps only the first letter of each word.
   * 'ignoreSingleLetters' will tell if single letter elements are word or not.
   * @examples:
   *     capitalize()                                         =>  ""
   *     capitalize("")                                       =>  ""
   *     capitalize("h")                                      =>  "H"
   *     capitalize("h", true)                                =>  "h"
   *     capitalize("11", true)                               =>  "11"
   *     capitalize("  $%^&| @ Once      upon a   time   |")  =>  "  $%^&| @ Once      Upon A   Time   |"
   */
  function capitalize (str, ignoreSingleLetters) {
    /* Input String validation */
    if (typeof str !== 'string' || str.length === 0) return ''

    /* Normally we'll capitalize all non-space string elements */
    if (typeof ignoreSingleLetters !== 'boolean') ignoreSingleLetters = false

    var words = str.match(/\S+/g) || []
    var spaces = str.match(/\s+/g) || []

    /* Capitalize all 'words' elements */
    for (var i = 0; i < words.length; ++i) {
      var word = words[i]

      if (word.length === 1 && ignoreSingleLetters) continue

      words[i] = word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase()
    }

    var startElementPreorder = (str[0] === ' ') * 1
    var capitalizedString = ''
    var wordI = 0
    var spaceI = 0
    var totalElements = words.length + spaces.length

    /* Combine the final string from both space and non-space elements by alternative pushing */
    for (var totalI = 0; totalI < totalElements; ++totalI) {
      if ((totalI + startElementPreorder) % 2) {
        capitalizedString += spaces[ spaceI++ ]
      } else {
        capitalizedString += words[ wordI++ ]
      }
    }

    return capitalizedString
  }

  /*
    For any given function,
    it will return an array of strings,
    presenting the incoming function arguments as names.
    Example:
      getFunctionArgumentsNames(function (name, _uid, callback) { ... })  =>  ['name', '_uid', 'callback']
  */
  var getFunctionArgumentsNames = (function () {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m
    var FN_ARG_SPLIT = /,/
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/

    return function (fn) {
      if (typeof fn !== 'function') {
        throw new TypeError('1st argument must be a function')
      }

      var fnText = fn.toString().replace(STRIP_COMMENTS, '')
      var argsDeclarationMatch = fnText.match(FN_ARGS)

      if (!argsDeclarationMatch) {
        return []
      }

      /* Go through all matched arguments and filter them */
      return argsDeclarationMatch[1]
        .split(FN_ARG_SPLIT)
        .map(function (arg) {
          return arg.split(FN_ARG)[2]
        })
    }
  })()

  /**
   * Common function to iterate through an Array or an Object of elements.
   * If the callback function return false - iteration will be stopped.
   *
   * @param  {Object}    obj       JSON object or an Array which we can use for iteration
   * @param  {Function}  callback  The notification function which will be sent pairs of data from the incoming 'obj'
   * @return {Boolean}             Tells if there were an iteration looping or not
   */
  /* NOTE: It is important to remember that looping using this function will not brake "the sync model of events"
           since we have not used any async function while iterating.
  */
  function each (obj, callback) {
    /* Immediately exit from the function if any of the mandatory arguments is missing */
    if (typeof obj !== 'object') return false
    if (obj === null) return false
    if (typeof callback !== 'function') return false

    /* Determine an Array or an Object */
    if (obj instanceof Array) {
      /* Cache common loop elements */
      /* NOTE: Caching 'obj.length' will prevent iterating over newly added elements,
              which will help keeping this function as close as possible to 'Array.prototype.forEach'
      */
      var length = obj.length

      /* Go through all Array elements and send them back to the callback function as an element-index pair */
      for (var i = 0; i < length; ++i) {
        /* Be sure that the element we're attempting to iterate over still exists */
        if (i in obj) {
          /* Exit from the loop if the callback explicitly ask for it */
          if (callback(obj[i], i, obj) === false) break
        }
      }
    } else {
      /* Go through all own Object key - value pairs and send them 1 by 1 to the callback function */
      var ownKeys = Object.keys(obj)
      for (i = 0; i < ownKeys.length; ++i) {
        var key = ownKeys[i]

        /*
          Send only 'own properties' and
          exit from the loop if the callback explicitly ask for it
        */
        if (callback(obj[key], key, obj) === false) break
      }
    }

    /* Gives a positive reaction when looping is completed */
    return true
  }

  /**
   * Recursive function that will create a variable clone of any type: Object, Function or Primitive types
   * NOTE: _.clone() does not create a function clone
   *
   * @dependences
   *     each()
   */
  var clone = (function () {
    /* Return a clone of a function */
    function cloneFunction (func) {
      return function () {
        return func.apply(this, arguments)
      }
    }

    return function (variable) {
      /* Quick check for common "empty" vars */
      if (variable === '') return ''
      if (variable === []) return []
      if (variable === {}) return {}
      if (variable === null) return null
      if (isNaN(variable)) return NaN

      /* Since this function is recursive, it's important to recreate the cloned variable on every call */
      var clonedVar = {}

      /* Determine income variable type */
      if (typeof variable === 'object') {
        if (variable instanceof Date) {
          clonedVar = new Date(variable.getTime())
        } else if (variable instanceof RegExp) {
          clonedVar = new RegExp(variable.toString())
        } else {
          /* Check if we need to recreate an Array or an Object */
          clonedVar = variable instanceof Array ? [] : {}

          /* NOTE: Array.slice() will copy-by-address all array elements */

          /* Go through each variable key - value pairs and recursively clone them */
          each(variable, function (value, key) {
            clonedVar[key] = clone(value)
          })
        }
      } else if (typeof variable === 'function') {
        /* Use the internal function to clone a function variable */
        clonedVar = cloneFunction(variable)
      } else {
        /* Just copy the variable since it's from a primitive type */
        clonedVar = variable
      }

      return clonedVar
    }
  })()

  /**
   * Use a common formated string and an optional Date object to produce more user-friendly date string
   * Everything not to be format should be in brackets []
   *
   * @dependences
   *     isInteger()
   *     setDigits()
   *
   * @param  {string}    format    Used to replace each date token with a predefined date string
   * @param  {timestamp} timestamp Optional timestamp to be used as a template. If not specified, will use the current date timestamp
   * @return {string}              'humanized' date string with all available tokens included
   *
   * @examples
   *     formatDate()                            => '11:21:05 27.03.2013'
   *     formatDate('ddd MM.YYYY')               => 'Wed 03.2013'
   *     formatDate('hh:mm:ss a', 1000000000000) => '04:46:40 am'
   *     formatDate('[Today is] DD [HH mm ss]')  => 'Today is 18 HH mm ss'
   *
   *     formatDate('YYYY [years], MM [months], DD [days], HH [hours], m [minutes], s [seconds], xxx [milliseconds]', 1020) => '1970 years, 01 months, 01 days, 02 hours, 0 minutes, 1 seconds, 020 milliseconds '
   */
  var formatDate = (function () {
    var monthDay = -1
    var weekDay = -1
    var SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    var month = -1
    var SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    var LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    var hours = -1
    var minutes = -1
    var seconds = -1
    var milliseconds = -1
    var amPm = ''

    /* Everything in 'format' will be replaced by a component from 'date' */
    function formatDatePart (format, date) {
      /* Replace Year tokens */
      format = format.replace(/YYYY/g, date.getFullYear())
      format = format.replace(/YY/g, date.getFullYear() % 100)

      /* Replace Day of the Month tokens */
      monthDay = date.getDate()
      format = format.replace(/DD/g, setDigits(monthDay, 2))
      format = format.replace(/D/g, monthDay)

      /* Replace Hour tokens */
      hours = date.getHours()
      format = format.replace(/HH/g, setDigits(hours, 2))
      format = format.replace(/H/g, hours)
      format = format.replace(/hh/g, setDigits(hours % 12, 2))
      format = format.replace(/h/g, hours % 12)

      /* Replace Minutes tokens */
      minutes = date.getMinutes()
      format = format.replace(/mm/g, setDigits(minutes, 2))
      format = format.replace(/m/g, minutes)

      /* Replace AM/PM tokens */
      amPm = hours < 12 ? 'am' : 'pm'
      format = format.replace(/a/g, amPm)
      format = format.replace(/A/g, amPm.toUpperCase())

      /* Replace Seconds tokens */
      seconds = date.getSeconds()
      format = format.replace(/ss/g, setDigits(seconds, 2))
      format = format.replace(/s/g, seconds)

      /* Replace Milliseconds tokens */
      milliseconds = date.getMilliseconds()
      format = format.replace(/xxx/g, setDigits(milliseconds, 3))

      /* Replace Month tokens */
      month = date.getMonth()
      format = format.replace(/MMMM/g, LONG_MONTHS[month])
      format = format.replace(/MMM/g, SHORT_MONTHS[month])
      format = format.replace(/MM/g, setDigits(month+1, 2))
      format = format.replace(/M([^a])/g, month+1 +'$1')   /* Prevent replacing 'M' in 'May' */

      /* Replace Day of the Week tokens */
      weekDay = date.getDay()
      format = format.replace(/dddd/g, LONG_DAYS[weekDay])
      format = format.replace(/ddd/g, SHORT_DAYS[weekDay])

      /* Returns the pre formated date/time incoming string */
      return format
    }

    return function (format, timestamp) {
      /* Set default values */
      format = format || 'HH:mm:ss DD.MM.YYYY'
      timestamp = timestamp || new Date().getTime()

      /* Validate input */
      if (typeof format !== 'string') throw new Error('If specified, 1st argument must be a {sting} but you sent {' + typeof format + '} ' + format)
      if (!isInteger(timestamp)) throw new Error('If specified, 2nd argument must be a {timestamp} object but you sent {' + typeof timestamp + '} ' + timestamp)

      /* Convert validated timestamp into a JS Date object */
      var date = new Date(timestamp)

      /* Holds the final formated and non-formated string result */
      var formatedResult = ''

      /* Split the incoming 'format' in parts that need to have a Date format and parts that does not */
      each(format.split(/(\[[^\]]*\])/), function (format) {
        if (format.substr(0, 1) === '[' &&
            format.substr(-1, 1) === ']'
        ) {
          formatedResult += format.substr(1, format.length - 2)
        } else {
          formatedResult += formatDatePart(format, date)
        }
      })

      return formatedResult
    }
  })()

  /**
   * Convert a timestamp to game time with a maximum scope of minutes, e.g. '0:01', '6:00', '+6:10', '-16:20'
   *
   * @dependences
   *     isNumber()
   *     setDigits()
   *
   * @param  {Timestamp} timestamp     Unix timestamp [milliseconds] that need to be converted
   * @param  {Boolean}   showPlusSign  Indicates whenever we need to show a '+' sign in front of the final time if the timestamp is positive
   *
   * @return {String}    Final string form of the timestamp
   *
   * @examples
   *   minutesLimitedTime()                                     => '0:00'
   *   minutesLimitedTime( - (4 * 60 * 1000 + 7 * 1000) )       => '-4:07'
   *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000) )       => '4:07'
   *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000), true ) => '+4:07'
   */
  var minutesLimitedTime = (function () {
    var totalSeconds = 0
    var sign = ''
    var mathFunction = ''
    var minutes = 0
    var seconds = 0

    return function (timestamp, showPlusSign) {
      /* Secure function parameters */
      totalSeconds = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0
      showPlusSign = showPlusSign === true

      /* Check if we need to add the '+' sign in front of the final string result */
      sign = totalSeconds < 0 ? '-' : (showPlusSign ? '+' : '')
      totalSeconds = Math.abs(totalSeconds)

      /* Check which Math function we'll need for rounding calculation */
      mathFunction = totalSeconds < 0 ? 'ceil' : 'floor'

      /* Calculate the total amount of hours, minutes and seconds */
      minutes = Math[ mathFunction ](totalSeconds / 60)
      seconds = Math[ mathFunction ](totalSeconds - minutes * 60)

      /* Return a final formated time string */
      return sign + minutes + ':' + setDigits(seconds, 2)
    }
  })()

  /*
    Converts the incoming Unix timestamp [milliseconds] in more "human" formated string.
    When showPlusSign is set to true we'll show a '+' in front if the timestamp is a > 0.
  */
  var hoursLimitedTime = (function () {
    var totalSeconds = 0
    var sign = ''
    var mathFunction = ''
    var hours = 0
    var minutes = 0
    var seconds = 0

    return function (timestamp, showPlusSign, extendOver24Hours) {
      /* Secure function parameters */
      totalSeconds = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0
      showPlusSign = showPlusSign === true

      /* Check if we need to add the '+' sign in front of the final string result */
      sign = totalSeconds < 0 ? '-' : (showPlusSign ? '+' : '')
      totalSeconds = Math.abs(totalSeconds)

      /* Tells if we need to clamp the hours to the last 24 */
      if (!extendOver24Hours) totalSeconds %= 24 * 60 * 60

      /* Check which Math function we'll need for rounding calculation */
      mathFunction = totalSeconds < 0 ? 'ceil' : 'floor'

      /* Calculate the total amount of hours, minutes and seconds */
      hours = Math[ mathFunction ](totalSeconds / 60 / 60)
      minutes = Math[ mathFunction ](totalSeconds / 60 - hours * 60)
      seconds = Math[ mathFunction ](totalSeconds - minutes * 60 - hours * 60 * 60)

      /* Return a final formated time string */
      return sign + setDigits(hours, 2) + ':' + setDigits(minutes, 2) + ':' + setDigits(seconds, 2)
    }
  })()

  /**
   * Will take the parse the incoming '_milliseconds' into Years, Months, Days, hours, minutes, seconds, and milliseconds and
   * replace them in the incoming {string} 'format'
   *
   * @dependencies
   *     each
   *     setDigits
   *
   * @example
   *     humanLimitedTime( 4*12*30*24*60*60*1000 + 3*30*24*60*60*1000 + 3*24*60*60*1000 + 4*60*60*1000 + 5*60*1000 + 6*1000 + 789)                =>  '4 years, 3 months, 3 days, 4 hours, 5 minutes, 6 seconds, 789 milliseconds'
   *     humanLimitedTime( 4*12*30*24*60*60*1000 + 3*30*24*60*60*1000 + 3*24*60*60*1000 + 4*60*60*1000 + 5*60*1000 + 6*1000 + 789, 'h:mm:ss.ii')  =>  '36796:05:06.789'
   */
  var humanLimitedTime = (function () {
    var years = 0
    var months = 0
    var days = 0
    var hours = 0
    var minutes = 0
    var seconds = 0
    var milliseconds = 0

    /*
      Will determine the exact count of each time components (year, mounts, days, etc) and
      will set limit values for each by summing the rest to the maximum met time component:
      this means that if 'hh' or 'h' is the maximum component if 'format', then hours count could go above 24.
    */
    function setTimeComponents (format) {
      /* General time distribution between common time components */
      years = Math.floor(milliseconds / 1000 / 60 / 60 / 24 / 30 / 12)
      months = Math.floor(milliseconds / 1000 / 60 / 60 / 24 / 30 - years * 12)
      days = Math.floor(milliseconds / 1000 / 60 / 60 / 24 - years * 12 * 30 - months * 30)
      hours = Math.floor(milliseconds / 1000 / 60 / 60 - years * 12 * 30 * 24 - months * 30 * 24 - days * 24)
      minutes = Math.floor(milliseconds / 1000 / 60 - years * 12 * 30 * 24 * 60 - months * 30 * 24 * 60 - days * 24 * 60 - hours * 60)
      seconds = Math.floor(milliseconds / 1000 - years * 12 * 30 * 24 * 60 * 60 - months * 30 * 24 * 60 * 60 - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60)
      milliseconds = milliseconds % 1000

      /*
        The block below will determine till what time component we need to limit our calculation.
        For example, if the maximum met component is 'DD' or 'D', then days count could go above 30.
      */
      var componentsFormat = format.replace(/\[(.*?)\]/g, '');
      (function () {
        if (/YY/g.test(componentsFormat) ||
            /Y/g.test(componentsFormat)
        ) {
          return
        }

        months += years * 12
        years = 0
        if (/MM/g.test(componentsFormat) ||
            /M/g.test(componentsFormat)
        ) {
          return
        }

        days += months * 30
        months = 0
        if (/DD/g.test(componentsFormat) ||
            /D/g.test(componentsFormat)
        ) {
          return
        }

        hours += days * 24
        days = 0
        if (/hh/g.test(componentsFormat) ||
            /h/g.test(componentsFormat)
        ) {
          return
        }

        minutes += hours * 60
        hours = 0
        if (/mm/g.test(componentsFormat) ||
            /m/g.test(componentsFormat)
        ) {
          return
        }

        seconds += minutes * 60
        minutes = 0
        if (/ss/g.test(componentsFormat) ||
            /s/g.test(componentsFormat)
        ) {
          return
        }

        /*
          None of the above time components were found in the incoming 'format'
          so we'll return the total amount of milliseconds which is exactly the same as the incoming '_milliseconds'
        */
        milliseconds += seconds * 1000
      })()
    }

    /* Returns pre-formated date/time incoming string */
    function formatPart (format) {
      format = format.replace(/YY/g, setDigits(years, 2))
      format = format.replace(/Y/g, years)

      format = format.replace(/MM/g, setDigits(months, 2))
      format = format.replace(/M/g, months)

      format = format.replace(/DD/g, setDigits(days, 2))
      format = format.replace(/D/g, days)

      format = format.replace(/hh/g, setDigits(hours, 2))
      format = format.replace(/h/g, hours)

      format = format.replace(/mm/g, setDigits(minutes, 2))
      format = format.replace(/m/g, minutes)

      format = format.replace(/ss/g, setDigits(seconds, 2))
      format = format.replace(/s/g, seconds)

      format = format.replace(/ii/g, setDigits(milliseconds, 2))
      format = format.replace(/i/g, milliseconds)

      return format
    }

    return function (_milliseconds, format) {
      milliseconds = _milliseconds

      /* Secure function parameters */
      if (!isInteger(milliseconds) || milliseconds < 0) milliseconds = 0
      if (typeof format !== 'string') format= 'Y [years], M [months], D [days], h [hours], m [minutes], s [seconds], i [milliseconds]'

      /* Will determine the exact value of each days, mounts, years, and all the rest time components */
      setTimeComponents(format)

      /* Holds the final formated and non-formated string result */
      var formatedResult = ''

      /* Split the incoming 'format' in parts that need to have a Date format and parts that does not */
      each(format.split(/(\[[^\]]*\])/), function (format) {
        if (format.substr(0, 1) === '[' &&
            format.substr(-1, 1) === ']'
        ) {
          formatedResult += format.substr(1, format.length - 2)
        } else {
          formatedResult += formatPart(format)
        }
      })

      return formatedResult
    }
  })()

  /**
   * Set of utilities to present Client/Browser timezone difference from UTC/GMT
   *
   * @dependences
   *     setDigits()
   *
   * @return  {Object}  List of all client Timezone properties generated
   */
  var timezone = (function () {
    var clientDate = new Date()
    var offset = clientDate.getTimezoneOffset()
    var hours = Math.floor(offset / 60)
    var minutes = Math.abs(offset % 60)
    var abbreviationMatch = clientDate.toString().match(/\(([^)]+)\)$/)

    /* NOTE: We invert the hours here because getTimezoneOffset() returns time difference between UTC and local time in [minutes], not vise versa
            https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
            http://msdn.microsoft.com/en-us/library/ie/014ykh71(v=vs.94).aspx
    */
    hours = -hours

    return {
      minutes: offset,  /* [minutes] */
      timestamp: offset * 60 * 1000,  /* [milliseconds] */
      label: 'GMT ' + (-offset > 0 ? '+' : '') + hours + ':' + setDigits(minutes, 2),  /* UI presentation */
      abbreviation: abbreviationMatch ? abbreviationMatch[1] : ''  /* Common description timezone text, e.g. "UTC", "CET", "CEST" */
    }
  })()

  /**
   * Returns a helpful set of properties regarding a given 'date' (Date instance).
   * If 'date' is not given the current User Date is been used.
   *
   * @param  {Date} date  Optional Date instance used to determine the DST properties of
   * @return {JSON}       List of helpers telling more about the User timezone. More explanation is given in the 'return' method.
   */
  function daylightSavingTime (date) {
    if (!(date instanceof Date)) date = new Date()

    /* Stores the current or predefined Client Date moment */
    var currentYear = date.getFullYear()

    /* Secure a Winder date with no DST set and Summer date where DTS can be set if available for the current User timezone */
    var january1st = new Date(currentYear, 0, 1)
    var june1st = new Date(currentYear, 5, 1)

    var canBeSet = january1st.getTimezoneOffset() !== june1st.getTimezoneOffset()

    var abbreviationMatch = date.toString().match(/\(([^)]+)\)$/)

    return {
      /* Tells if DTS is in use for the current User timezone */
      canBeSet: canBeSet,

      /* Tells if DST is currently been added */
      is_set: canBeSet && date.getTimezoneOffset() === june1st.getTimezoneOffset(),

      /* Gives the DTS timezone abbreviation when DTS is set e.g. 'CEST', 'EEST', 'AEST' */
      type: canBeSet ? (abbreviationMatch ? abbreviationMatch[1] : '') : ''
    }
  }

  /**
   * Used in the way of Underscore _.bind() function
   *
   * @param  {Function}  fn     Function to be called in the sent scope
   * @param  {Object}    scope  Object scope that will execute the incoming function
   */
  function bind (func, context) {
    return function () {
      return func.apply(context, arguments)
    }
  }

  /**
   * Duplicates the behavior of the _.extend() function.
   * If the 1st argument is an source object
   * the function will use all the rest given objects to clone all their properties into the 1st object source.
   * Overriding is allowed by the rule of "later object overrides the former".
   *
   * @dependences
   *     each()
   */
  var extend = (function () {
    var args = []
    var source = null

    return function () {
      /* Convert to Array for better handling  */
      args = Array.prototype.slice.call(arguments)

      /* Validate source object */
      source = args.shift()
      if (typeof source !== 'object' && source != null) throw new Error('1st argument must be a source {Object} but you sent {' + typeof source + '} ' + source)

      /* Go over each incoming arguments, if any left */
      each(args, function (obj, id) {
        /* Validate object argument */
        if (typeof obj !== 'object') throw new Error('Argument ' + (id + 2) + ' must be an {Object} but you sent {' + typeof obj + '} ' + obj)

        /* Copy by reference each argument object properties over the source */
        each(obj, function (value, key) {
          source[key] = value
        })
      })

      /* Give the combined source object */
      return source
    }
  })()

  /**
   * Checks if the incoming 'obj' has any properties or length
   *
   * @dependences
   *     isNumber()
   *     each()
   *
   * @param  {Mixed}   obj  Variable to be checked if it has any looping data
   * @return {Boolean}      Flag if the incoming 'obj' is considered empty or not
   */
  function isEmpty (obj) {
    var hasProperties = false

    switch (obj) {
      /* Common case scenario */
      case null:
      case {}:
      case []:
      case '':
      case undefined:
        return true

      default:
        /* Any number is an empty object */
        if (isNumber(obj)) return true

        /* Any {String} with length will be considered not empty */
        if (typeof obj === 'string' && obj.length) return false

        /* Check if the incoming object contain any properties */
        each(obj, function () {
          hasProperties = true
          return false
        })

        return !hasProperties
    }
  }

  /**
   * Checks if the first two incoming variables are equal by type and value.
   * Objects are not been compared by property position but by property value, type, and length.
   *
   * @dependences
   *     each()
   *     isEmpty()
   *
   * @param  {Mixed}  var1  1st var to be compared
   * @param  {Mixed}  var2  2nd var to be compared
   * @return {Boolean}      Tells if both vars are "equal" or not
   */
  function isEqual (var1, var2) {
    var isEqual

    /* Check if we need to compare 2 Objects */
    if (typeof var1 === 'object' &&
        typeof var2 === 'object'
    ) {
      /* Try "lazy comparison" by converting the {Object} into {String} comparison */
      if (JSON.stringify(var1) === JSON.stringify(var2)) return true

      /* Prevent data integrity */
      var2 = clone(var2)

      /* Check if all properties from var1 are met in var2 */
      isEqual = true
      each(var1, function (value, key) {
        /* Check if there's the same property in var2 */
        if (var2[key] === value) {
          /* Try to leave var2 as empty object */
          delete var2[key]
        } else {
          /* Mark the mismatch and prevent further looping */
          isEqual = false
          return false
        }
      })

      /* Final check if var2 has any properties left */
      return isEqual ? isEmpty(var2) : false
    } else {
      /* Use the general compare operator if both are not objects */
      return var1 === var2
    }
  }

  /**
   * The function 'func' will be executed only when there's a timeout
   * of 'timeout' [milliseconds] between now and last 'func' call.
   * http://benalman.com/projects/jquery-throttle-debounce-plugin/
   *
   * @param  {function}  func     The function that need to be executed only once after a specified 'timeout' time
   * @param  {integer}   timeout  Time in [milliseconds] that need to expire before calling the 'func' function
   */
  function debounce (func, timeout) {
    var timer, THIS, args, result

    /* Validate input */
    if (typeof func !== 'function') throw new Error('1st argument must be a {function} but you sent {' + typeof func + '} ' + func)
    if (!isInteger(timeout)) throw new Error('2nd argument must be a milliseconds {integer} number but you sent {' + typeof timeout + '} ' + timeout)

    var debouncedFunc = function () {
      THIS = this
      args = arguments

      /* Functional scope that will execute the incoming 'func' in a later time */
      function executeFunc () {
        clearTimeout(timer)
        timer = null
        result = func.apply(THIS, args)
      }

      /* Secure a single calling of the 'func' */
      clearTimeout(timer)
      timer = setTimeout(executeFunc, timeout)

      /* If there's no timer set we'll execute and collect the 'func' result right away */
      if (!timer) result = func.apply(THIS, args)

      return result
    }

    debouncedFunc.cancel = function () {
      clearTimeout(timer)
      timer = null
      result = undefined
    }

    return debouncedFunc
  }

  /**
   * Used to execute any function only once in a specified time frame
   * http://benalman.com/projects/jquery-throttle-debounce-plugin/
   *
   * @param  {function}  func     The function that need to be executed only once after a specified 'timeout' time
   * @param  {integer}   timeout  Time in [milliseconds] between each 'func' executions
   */
  function throttle (func, timeout) {
    var timer
    var result
    var THIS
    var args
    var callAfterTimeout = false

    /* Validate input */
    if (typeof func !== 'function') throw new Error('1st argument must be a {function} but you sent {' + typeof func + '} ' + func)
    if (!isInteger(timeout)) throw new Error('2nd argument must be a milliseconds {integer} number but you sent {' + typeof timeout + '} ' + timeout)

    return function () {
      THIS = this
      args = arguments

      function executeFunc () {
        /* Check if there already a delayed watcher for 'func' */
        if (!timer) {
          timer = setTimeout(function () {
            /*
              Check if there's a 2nd, 3rd, ... call for 'func' and
              if so, reschedule another delayed watcher
            */
            if (callAfterTimeout) {
              clearTimeout(timer)
              timer = null
              callAfterTimeout = false

              executeFunc()
            }
          }, timeout)
        }

        result = func.apply(THIS, args)
      }

      /* Check if this is the 1st call or the 2nd, 3rd, ..., in the respected 'timeout' */
      if (!timer) {
        executeFunc()
      } else {
        callAfterTimeout = true
      }

      return result
    }
  }

  /**
   * Cross-browser detection of jQuery event key code.
   *
   * @dependences
   *     setDigits()
   *
   * @param  {jQuery event}  event  A common event object come from 'keydown', 'keyup', or 'keypress' jQuery event callbacks
   * @return {Integer}              Final detected code of the pressed key
   */
  function eventToKey (event) {
    return event.keyCode ? event.keyCode : event.which
  }

  /**
   * Return a section from the URL path (/section1/section2/...) by a given 0-based section position.
   *
   * @dependences
   *     window - top DOM object
   *
   * @param   Integer partPos
   * @returns Mixed
   *
   * @example
   *   getHrefPart(0)   => 'viewer'
   *   getHrefPart(999) => undefined
   *   getHrefPart('a') => undefined
   */
  function getHrefPart (partPos) {
    partPos = parseInt(partPos, 10)

    return (!isNaN(partPos) &&
      typeof window === 'object' &&
      typeof window.location === 'object' &&
      typeof window.location.pathname === 'string'
    )
    ? window.location.pathname.split('/')[ ++partPos ]
    : undefined
  }

  /**
   * Takes a query parameter out of the URL.
   * Credit to: http://stackoverflow.com/a/901144
   *
   * @example
   *   if the tab URL is 'http://localhost/page.com?var_1=1&var_2=2'
   *   getUrlParameterByName('va_1')  =>  "1"
   */
  function getUrlParameterByName (name, url) {
    if (!url) url = window.location.href

    name = String(name).replace(/[\[\]]/g, '\\$&')
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    const results = regex.exec(url)

    if (!results) return null
    if (!results[2]) return ''

    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  /**
   * Formats currency
   * @param {number} n - the number to format
   * @param {number} decimalPlaces - the number of decimal places to round to
   * @return {string|null} - the formatted string
   */
  function formatCurrency (n, decimalPlaces = 2) {
    if (isNaN(n) || !n || typeof n !== 'number') {
      return null
    }
    return n.toFixed(decimalPlaces).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  }

  /* Quick and reliable RegExp for validating email addresses */
  var emailTest = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  /* List of all externally accessed functionalities */
  var utils = {
    log: log,
    documentLog: documentLog,

    trim: trim,
    normalize: normalize,
    toString: toString,
    clampString: clampString,
    camelCaseToUnderscore: camelCaseToUnderscore,
    capitalize: capitalize,
    getFunctionArgumentsNames: getFunctionArgumentsNames,

    clampNumber: clampNumber,
    roundAfterPoint: roundAfterPoint,
    isNumber: isNumber,
    isFloat: isFloat,
    isInteger: isInteger,
    setDigits: setDigits,
    greatestCommonDivisor: greatestCommonDivisor,
    floatToFraction: floatToFraction,
    getPowerLog: getPowerLog,
    convertNumberBase: convertNumberBase,
    getRandomNumber: getRandomNumber,
    getRandomColor: getRandomColor,

    each: each,
    clone: clone,

    toArray: toArray,
    objectLength: objectLength,
    jsonParseSafe: jsonParseSafe,
    jsonStringifySafe: jsonStringifySafe,
    recursiveFreezeObject: recursiveFreezeObject,
    getInstance: getInstance,

    formatDate: formatDate,
    minutesLimitedTime: minutesLimitedTime,
    hoursLimitedTime: hoursLimitedTime,
    humanLimitedTime: humanLimitedTime,
    timezone: timezone,
    daylightSavingTime: daylightSavingTime,

    bind: bind,
    extend: extend,
    isEmpty: isEmpty,
    isEqual: isEqual,
    debounce: debounce,
    throttle: throttle,
    eventToKey: eventToKey,

    getHrefPart: getHrefPart,
    getUrlParameterByName: getUrlParameterByName,

    formatCurrency: formatCurrency,
    emailTest: emailTest
  }

  /* Determine if we need to make an export for Node.js or common browser 'window' client */
  var exportObject = typeof module === 'object' && typeof module.exports === 'object' ? module.exports : (typeof window === 'object' ? (window.utils = {}) : {})

  /* Extend and override with all utility functions the object meant to be used for external access */
  each(utils, function (utilFunction, utilName) {
    exportObject[ utilName ] = utilFunction
  })
})()

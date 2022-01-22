<template>
<v-text-field
  ref='field'
  :prefix="prefix"
  v-model='model'
  @focus='onFocus'
  @keyup='onKeyUp'
  :error-messages='errorMessages'
  v-bind='$attrs'
  @change='onChange'
  @blur='onBlur'
  ></v-text-field>
</template>

<script>
function tryParseFloat (str, defaultValue) {
  var retValue = defaultValue
  if (str !== null) {
    if (str.length > 0) {
      if (!isNaN(str)) {
        retValue = parseFloat(str)
      }
    }
  }
  return retValue
}
export default {
  props: {
    value: null,
    'error-messages': null,
    allowNegative: {
      type: Boolean,
      default: false
    },
    prefix: {
      type: String,
      default: '$ '
    },
    thousandsSeparator: {
      type: String,
      default: ','
    },
    decimalSeparator: {
      type: String,
      default: '.'
    },
    languageCode: {
      type: String,
      default: 'en-US'
    },
    precision:{
      type: Number,
      default: 2
    }
  },
  data () {
    return {
      numberValue: this.value,
      model: this.value,
      isMasked: true,
      thousandsSeparatorRegex: new RegExp(`\\${this.thousandsSeparator}`, 'g'),
      decimalSeparatorRegex: new RegExp(`\\${this.decimalSeparator}`, 'g'),
      nprecision: this.precision,
    }
  },
  methods: {
    onFocus () {
      this.isMasked = false
      this.updateModel()
    },
    onBlur () {
      if (this.$listeners.blur) this.$listeners.blur()
      this.isMasked = true
      this.format()
    },
    onKeyUp () {
      this.updateNumberValue()
    },
    onChange () {
      if (this.$listeners.change) this.$listeners.change()
    },
    updateModel () {
      if (this.numberValue === null) return
      let v = this.numberValue.toString()
      v = v.replace(this.thousandsSeparatorRegex, this.decimalSeparator)
      this.model = v
    },
    roundNumber(num, scale) {
      //https://stackoverflow.com/a/12830454/4537233
      if(!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale)  + "e-" + scale);
      } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if(+arr[1] + scale > 0) {
          sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
      }
    },
    updateNumberValue () {
      let v = this.model
      let parsed
      v = v.replace(this.thousandsSeparatorRegex, '')
      if (this.decimalSeparator !== '.') v = v.replace(this.decimalSeparatorRegex, this.thousandsSeparator)
      const result = tryParseFloat(v)
      if (!result) parsed = 0
      else parsed = result
      if (!this.allowNegative && result < 0) parsed = 0
      this.numberValue = this.roundNumber(parsed, this.nprecision); //Math.round(parsed * 100) / 100
    },
    format () {
      if (this.numberValue === null) return
      let v = this.numberValue
      v = v.toLocaleString(this.languageCode, {maximumFractionDigits:this.nprecision})
      if (v.length !== 1 && v.slice(v.indexOf(this.decimalSeparator) + 1).length === 1) v += '0'
      this.model = v
    }
  },
  watch: {
    numberValue (v) {
      this.$emit('input', v)
    },
    value (v) {
      this.numberValue = v
      if (!this.$refs.field.isFocused) {
        this.format()
      }
    }
  },
  created () {
    this.format()
  }
}
</script>

<style lang="scss" scoped>
</style>
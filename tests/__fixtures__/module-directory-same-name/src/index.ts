import test from '~/test'
import test2 from '~/test2'
// @ts-expect-error this is an invalid import, because test3 doesn't have index
import test3 from '~/test3'

console.log(test)
console.log(test2)
console.log(test3)

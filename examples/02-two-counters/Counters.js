import {Observable as O} from "rx"
import {h} from "@cycle/dom"
import isolate from "@cycle/isolate"

import Counter from "../01-counter/Counter"

export default function main({DOM, M}) {
  const state$ = M
  const a$ = state$.lens("a")
  const b$ = state$.lens("b")
  // we can use "lensed" a$ and b$ as a driver for child components
  const a = isolate(Counter)({DOM, M: a$})
  const b = isolate(Counter)({DOM, M: b$})

  const resetMod$ = DOM.select(".reset").events("click").map(() => () => ({a: 0, b: 0}))
  const aMod$ = a.M
  const bMod$ = b.M

  const vdom$ = O.combineLatest(state$, a.DOM, b.DOM, (state, a, b) =>
    h("div", [
      a, b,
      h("hr"),
      h("h2", `Total: ${state.a + state.b}`),
      h("button.reset", "Reset")
    ]))

  return {
    DOM: vdom$,
    // a.M and b.M are already converted to Model driver's mods
    // in Counter component so we can merge them to parent's mods
    // directly
    M: O.merge(M.mod(resetMod$), aMod$, bMod$)
  }
}

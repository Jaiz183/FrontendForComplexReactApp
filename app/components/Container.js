import React from "react"

function Container(props) {
  return (
    <div
      className={
        props.wide ? "container py-md-5" : "container container--narrow py-md-5"
      }
    >
      {props.children}
    </div>
  )
}

export default Container

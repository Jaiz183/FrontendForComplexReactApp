import React from "react"
import { Link } from "react-router-dom"
import Page from "./Page"

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>This page does not exist at the moment!</h2>
        <p>
          Return to your homepage <Link to={"/"}>here</Link>.
        </p>
      </div>
    </Page>
  )
}

export default NotFound

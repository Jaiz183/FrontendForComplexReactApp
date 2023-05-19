import React, { useEffect, useState, useContext } from "react"
import { useImmerReducer } from "use-immer"
import { Link, useParams } from "react-router-dom"
import Axios from "axios"
import ReactMarkdown from "react-markdown"
import Tooltip from "@mui/material/Tooltip"

import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import NotFound from "./NotFound"

import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function EditPost() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const initialState = {
    title: { value: "", hasErrors: false, errorMessage: "" },
    body: { value: "", hasErrors: false, errorMessage: "" },
    fetching: true,
    saving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchData":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.fetching = false
        return
      case "saveTitle":
        draft.title.value = action.value
        return
      case "saveBody":
        draft.body.value = action.value
        return
      case "saveChangesStart":
        draft.saving = true
        // console.log(draft.sendCount)
        return
      case "submitRequest":
        async function submitRequest() {
          try {
            await Axios.post(`http://localhost:8080/post/${draft.id}/edit`, {
              title: draft.title.value,
              body: draft.body.value,
              token: appState.user.token
            })
          } catch (e) {
            console.log("There was an error: " + e)
          }
        }
        submitRequest()

      case "saveChangesEnd":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount += 1
        } else {
          appDispatch({
            type: "flashMessage",
            value: "Invalid title or body."
          })
        }
        draft.saving = false
        return

      case "titleChecker":
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.errorMessage = "Title must be non-empty."
        } else {
          draft.title.hasErrors = false
        }
        return

      case "bodyChecker":
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.errorMessage = "Body must be non-empty."
        } else {
          draft.body.hasErrors = false
        }
        return

      case "notFound":
        draft.notFound = true
        return

      default:
        return
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.get(
          `http://localhost:8080/post/${state.id}`
        )
        if (response.data) {
          dispatch({ type: "fetchData", value: response.data })
        } else {
          dispatch({ type: "notFound" })
        }

        // console.log(response.data)
      } catch (e) {
        console.log("There was an error: " + e.message)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (state.sendCount != 0) {
      appDispatch({
        type: "flashMessage",
        value: "Saved changes."
      })
    }
  }, [state.sendCount])

  async function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "saveChangesStart" })
    dispatch({ type: "submitRequest" })
    dispatch({ type: "saveChangesEnd" })
  }

  if (state.notFound) {
    return <NotFound />
  }

  if (state.fetching) {
    return (
      <Page title="...">
        {" "}
        <LoadingDotsIcon />{" "}
      </Page>
    )
  }

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post
      </Link>
      <form className="mt-2" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.errorMessage}
            </div>
          )}

          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
            onBlur={e =>
              dispatch({ type: "titleChecker", value: e.target.value })
            }
            onChange={e =>
              dispatch({ type: "saveTitle", value: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.errorMessage}
            </div>
          )}
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onBlur={e =>
              dispatch({ type: "bodyChecker", value: e.target.value })
            }
            onChange={e =>
              dispatch({ type: "saveBody", value: e.target.value })
            }
          ></textarea>
        </div>

        <button className="btn btn-primary" disabled={state.saving}>
          Save Changes
        </button>
      </form>
    </Page>
  )
}

export default EditPost

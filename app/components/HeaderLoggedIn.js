import React, { useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Tooltip from "@mui/material/Tooltip"

import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function HeaderLoggedIn() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  function handleSearch(e) {
    e.preventDefault()
    appDispatch({ type: "searchOn" })
    // console.log("Search bar open.")
    // console.log(appState.isSearchOn)
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <Tooltip
        title="Search"
        disableFocusListener
        disableTouchListener
        enterDelay={1000}
      >
        <a
          onClick={handleSearch}
          href="#"
          className="text-white mr-2 header-search-icon"
        >
          <i className="fas fa-search"></i>
        </a>
      </Tooltip>
      <Tooltip
        title="Chat"
        disableFocusListener
        disableTouchListener
        enterDelay={1000}
      >
        <span
          onClick={() => {
            appDispatch({ type: "chatToggle" })
            console.log("Chat toggled.")
          }}
          className={
            "mr-2 header-chat-icon text-" +
            (appState.messageCount ? "danger" : "white")
          }
        >
          <i className="fas fa-comment"></i>
          {appState.messageCount ? (
            <span className="chat-count-badge text-white">
              {" "}
              {appState.messageCount > 9 ? "9+" : appState.messageCount}
            </span>
          ) : (
            ""
          )}
        </span>
      </Tooltip>

      <Tooltip
        title="Profile"
        disableFocusListener
        disableTouchListener
        enterDelay={1000}
      >
        <Link to={`/profile/${appState.user.username}`} className="mr-2">
          <img className="small-header-avatar" src={appState.user.avatar} />
        </Link>
      </Tooltip>
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      <button
        onClick={() => {
          appDispatch({ type: "logout" })
          appDispatch({
            type: "flashMessage",
            value: "You are now logged out."
          })
          navigate("/")
        }}
        className="btn btn-sm btn-secondary"
      >
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn

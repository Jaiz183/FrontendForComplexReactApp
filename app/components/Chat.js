import React from "react"
import { useRef, useContext, useEffect } from "react"
import { useImmer } from "use-immer"
import io from "socket.io-client"
import { Link } from "react-router-dom"

import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function Chat() {
  const socket = useRef(null)
  const chatField = useRef(null)
  const chatLog = useRef(null)
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    chatFieldValue: "",
    chatMessages: []
  })

  function handleChatFieldChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.chatFieldValue = value
    })
    // console.log(state.chatFieldValue)
  }

  function handleSubmit(e) {
    e.preventDefault()
    // console.log(state.chatFieldValue)
    // Send message to chat server
    socket.current.emit("chatFromBrowser", {
      message: state.chatFieldValue,
      token: appState.user.token
    })

    setState(draft => {
      // Push sent message into array and clear input field.
      draft.chatMessages.push({
        message: draft.chatFieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar
      })
      draft.chatFieldValue = ""
    })
    console.log(state.chatMessages)
  }

  useEffect(() => {
    if (appState.isChatOn) {
      // Enables blinking cursor on chatField.
      chatField.current.focus()
      appDispatch({ type: "resetMessageCount" })
    }
  }, [appState.isChatOn])

  // Connecting to socket.
  useEffect(() => {
    // Establishes a socket connection with the backend server.
    socket.current = io(
      process.env.BACKENDURL ||
        "https://backendforcomplexreactapp.onrender.com/"
    )

    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })
    return () => socket.current.disconnect()
  }, [])

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight

    if (!appState.isChatOn && state.chatMessages) {
      appDispatch({ type: "incrementMessageCount" })
    }
  }, [state.chatMessages])

  return (
    <div
      id="chat-wrapper"
      className={
        "chat-wrapper shadow border-top border-left border-right " +
        (appState.isChatOn ? "chat-wrapper--is-visible" : "")
      }
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => {
            appDispatch({ type: "chatClose" })
            console.log("Chat closed.")
          }}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          } else {
            return (
              <div key={index} className="chat-other">
                <Link to={`/profile/${message.username}`}>
                  <img className="avatar-tiny" src={message.avatar} />
                </Link>
                <div key={index} className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username} </strong>
                    </Link>
                    {message.message}
                  </div>
                </div>
              </div>
            )
          }
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          value={state.chatFieldValue}
          onChange={handleChatFieldChange}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  )
}

export default Chat

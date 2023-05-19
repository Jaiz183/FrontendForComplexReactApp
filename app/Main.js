import React, { useState, useReducer, useEffect, lazy, Suspense } from "react"
import { useImmerReducer } from "use-immer"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://backendforcomplexreactapp.onrender.com/"

// Components
import FlashMessages from "./components/FlashMessages"
import Header from "./components/Header"
import Footer from "./components/Footer"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
const CreatePost = React.lazy(() => import("./components/CreatePost"))
const SinglePost = React.lazy(() => import("./components/SinglePost"))
import About from "./components/About"
import Terms from "./components/Terms"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))
import LoadingDotsIcon from "./components/LoadingDotsIcon"

// Context
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("token")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("token"),
      username: localStorage.getItem("username"),
      avatar: localStorage.getItem("avatar")
    },
    isSearchOn: false,
    isChatOn: false,
    messageCount: 0
  }

  function reducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "searchOn":
        draft.isSearchOn = true
        return
      case "searchOff":
        draft.isSearchOn = false
        return
      case "chatToggle":
        draft.isChatOn = !draft.isChatOn
        return
      case "chatClose":
        draft.isChatOn = false
        return
      case "incrementMessageCount":
        draft.messageCount++
        return
      case "resetMessageCount":
        draft.messageCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(reducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("token", state.user.token)
      localStorage.setItem("username", state.user.username)
      localStorage.setItem("avatar", state.user.avatar)
    } else {
      localStorage.clear()
    }
  }, [state.loggedIn])

  // Check if token has expired on first render.
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "http://localhost:8080/checkToken",
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          )

          // response.data is returned only if the token is still valid.
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({
              type: "flashMessage",
              value: "Your session has expired."
            })
          }
          // console.log(response.data)
        } catch (e) {
          console.log(`There was an error: ${e}.`)
        }
      }
      fetchResults()

      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route
                path="/"
                element={state.loggedIn ? <Home /> : <HomeGuest />}
              ></Route>
              <Route path="/create-post" element={<CreatePost />}></Route>
              <Route path="/post/:id" element={<SinglePost />}></Route>
              <Route path="/post/:id/edit" element={<EditPost />}></Route>
              <Route path="/about-us" element={<About />}></Route>
              <Route path="/terms" element={<Terms />}></Route>
              <Route path="/profile/:username/*" element={<Profile />}></Route>
              {/* Default case */}
              <Route path="*" element={<NotFound />}></Route>
            </Routes>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOn}
            unmountOnExit
            classNames="search-overlay"
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

// Asynchronously updates JS code to the dev server.
if (module.hot) {
  module.hot.accept()
}

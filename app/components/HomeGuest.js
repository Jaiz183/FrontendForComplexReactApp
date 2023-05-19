import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  // Setup to pull from app-wide dispatch
  const appDispatch = useContext(DispatchContext)

  // const [username, setUsername] = useState()
  // const [email, setEmail] = useState()
  // const [password, setPassword] = useState()
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      errorMessage: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      errorMessage: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      errorMessage: ""
    },
    submitCount: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.errorMessage =
            "Username cannot be longer than 30 characters."
        }

        if (
          draft.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasErrors = true
          draft.username.errorMessage = "Username cannot contain symbols."
        }
        return
      case "usernameAfterDelay":
        // Length check
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.errorMessage =
            "Username cannot be shorter than 3 characters."
        }

        // Unique check trigger
        if (!draft.username.hasErrors && !action.disableUniqueCheck) {
          draft.username.checkCount++
        }
        return
      case "usernameUnique":
        // Unique check for username - if action.value is true, the username already exists
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.errorMessage = "That username already exists."
        } else {
          // No same username has been found.
          draft.username.isUnique = true
        }
        return
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailAfterDelay":
        // Format check
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.errorMessage = "Invalid email address."
          // console.log(draft.email.errorMessage)
        }

        // Unique check trigger
        if (!draft.email.hasErrors && !action.disableUniqueCheck) {
          draft.email.checkCount++
        }
        return
      case "emailUnique":
        // Unique check for email
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.errorMessage = "That email already exists."
          // console.log(draft.email.errorMessage)
        } else {
          // No same email has been found.
          draft.email.isUnique = true
        }
        return
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value

        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.errorMessage =
            "Password cannot be longer than 50 characters."
          // console.log(draft.password.errorMessage)
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.errorMessage =
            "Password cannot be shorter than 12 characters."
          // console.log(draft.password.errorMessage)
        }
        return
      case "submitForm":
        if (
          !draft.username.hasErrors &&
          !draft.email.hasErrors &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({
      type: "usernameAfterDelay",
      value: state.username.value,
      disableUniqueCheck: true
    })
    dispatch({ type: "emailImmediately", value: state.email.value })
    dispatch({
      type: "emailAfterDelay",
      value: state.email.value,
      disableUniqueCheck: true
    })
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
  }

  // Watches for changes in username value in state and conducts client side validation after a delay.
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "usernameAfterDelay" })
      }, 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  // Watches for changes in email value and validates after delay.
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "emailAfterDelay" })
      }, 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  // Watches for changes in password value and validates after delay.
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "passwordAfterDelay" })
      }, 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  // Watches for changes in username checkCount and checks for uniqueness of username by making an Axios request.
  useEffect(() => {
    // Prevent useEffect from running when the page is first loaded - redundant!
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { cancelToken: ourRequest.token }
          )
          dispatch({ type: "usernameUnique", value: response.data })
          // console.log(response.data)
        } catch (e) {
          console.log(`There was an error: ${e}.`)
        }
      }
      fetchResults()

      return () => ourRequest.cancel()
    }
  }, [state.username.checkCount])

  // Watches for changes in email checkCount and checks for uniqueness of email by making an Axios request.
  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { cancelToken: ourRequest.token }
          )
          dispatch({ type: "emailUnique", value: response.data })
          // console.log(response.data)
        } catch (e) {
          console.log(`There was an error: ${e}.`)
        }
      }
      fetchResults()

      return () => ourRequest.cancel()
    }
  }, [state.email.checkCount])

  // Attempts to register user when form is submitted.
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value
            },
            { cancelToken: ourRequest.token }
          )

          appDispatch({ type: "login", data: response.data })
          appDispatch({
            type: "flashMessage",
            value: "You are now registered and logged in."
          })

          console.log(response.data)
        } catch (e) {
          console.log(`There was an error: ${e}.`)
        }
      }
      fetchResults()

      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  return (
    <Page title="Home" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
            posts that are reminiscent of the late 90&rsquo;s email forwards? We
            believe getting back to actually writing is the key to enjoying the
            internet again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "usernameImmediately",
                    value: e.target.value
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />

              <CSSTransition
                className="alert alert-danger small liveValidateMessage"
                in={state.username.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div>{state.username.errorMessage}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "emailImmediately",
                    value: e.target.value
                  })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />

              <CSSTransition
                className="alert alert-danger small liveValidateMessage"
                in={state.email.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div>{state.email.errorMessage}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                onChange={e =>
                  dispatch({
                    type: "passwordImmediately",
                    value: e.target.value
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />

              <CSSTransition
                className="alert alert-danger small liveValidateMessage"
                in={state.password.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div>{state.password.errorMessage}</div>
              </CSSTransition>
            </div>
            <button
              type="submit"
              className="py-3 mt-4 btn btn-lg btn-success btn-block"
            >
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest

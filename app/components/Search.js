import React, { useContext, useEffect } from "react"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"

import DispatchContext from "../DispatchContext"
import Post from "./Post"

function Search() {
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    requestCount: 0,
    searchTerms: "",
    results: [],
    loading: "neither"
  })

  useEffect(() => {
    document.addEventListener("keyup", handleKeyPress)
    return () => {
      document.removeEventListener("keyup", handleKeyPress)
    }
  }, [])

  useEffect(() => {
    if (state.searchTerms.trim()) {
      setState(draft => {
        draft.loading = "loading"
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
        // console.log(state.searchTerms)
      }, 700)

      // We know need to clean up setTimeout so that it is canceled when searchTerms changes before 5000 ms. Otherwise, all updates will be rendered, just delayed by a bit.
      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.loading = "neither"
      })
    }
  }, [state.searchTerms])

  // Send Axios request to get search results.
  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "http://localhost:8080/search",
            { searchTerm: state.searchTerms },
            { cancelToken: ourRequest.token }
          )
          setState(draft => {
            draft.results = response.data
            draft.loading = "loaded"
          })
          // console.log(response.data)
        } catch (e) {
          console.log(`There was an error: ${e}.`)
        }
      }
      fetchResults()

      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function handleInput(e) {
    setState(draft => {
      draft.searchTerms = e.target.value
    })
  }

  function handleKeyPress(e) {
    // 27 refers to the escape key.
    if (e.keyCode == 27) {
      appDispatch({ type: "searchOff" })
    }
  }

  function handleClose() {
    appDispatch({ type: "searchOff" })
  }

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
            onChange={handleInput}
          />
          <span onClick={handleClose} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              "circle-loader " +
              (state.loading == "loading" ? "circle-loader--visible" : "")
            }
          ></div>
          <div
            className={
              "live-search-results" +
              (state.loading == "loaded" ? "live-search-results--visible" : "")
            }
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> (
                  {`${state.results.length} item${
                    state.results.length != 1 ? "s" : ""
                  } found`}
                  )
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      post={post}
                      key={post._id}
                      onClick={() => {
                        appDispatch({ type: "searchOff" })
                      }}
                    />
                  )
                })}
              </div>
            )}

            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                {" "}
                No results found.{" "}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Search

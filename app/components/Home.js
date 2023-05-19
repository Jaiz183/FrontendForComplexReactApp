import React, { useContex, useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import { Link } from "react-router-dom"
import Axios from "axios"

import Page from "./Page"
import StateContext from "../StateContext"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({ isLoading: true, feed: [] })

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(
          "http://localhost:8080/getHomeFeed",
          { token: appState.user.token },
          { cancelToken: cancelRequest.token }
        )

        console.log(response.data)

        setState(draft => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (e) {
        console.log("There was an error: " + e.message)
      }
    }

    fetchData()
    return () => {
      cancelRequest.cancel()
    }
  }, [])

  if (state.isLoading) {
    return <LoadingDotsIcon />
  }

  return (
    <Page title="Feed">
      {!state.isLoading && state.feed && (
        <>
          <h2 className="text-center mb-4">Your Feed</h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} key={post._id} />
            })}
          </div>
        </>
      )}
      {!state.isLoading && !state.feed && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </>
      )}
    </Page>
  )
}

export default Home
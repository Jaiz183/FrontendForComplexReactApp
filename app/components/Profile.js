import React, { useContext, useEffect, useState } from "react"
import { useParams, NavLink, Routes, Route } from "react-router-dom"
import Axios from "axios"
import { useImmer } from "use-immer"

import Page from "./Page"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"

function Profile() {
  const { username } = useParams()
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isFollowLoading: false,
    stopFollowCount: 0,
    startFollowCount: 0,

    profileData: {
      username: "...",
      avatar: "https://gravatar.com/avatar/placeholder?s=128",
      posts: 0,
      followers: 0,
      following: 0,
      isFollowing: false
    }
  })

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token
          },
          { cancelToken: cancelRequest.token }
        )

        console.log(response.data)

        setState(draft => {
          draft.profileData = {
            username: response.data.profileUsername,
            avatar: response.data.profileAvatar,
            posts: response.data.counts.postCount,
            followers: response.data.counts.followerCount,
            following: response.data.counts.followingCount,
            isFollowing: response.data.isFollowing
          }
        })
      } catch (e) {
        console.log("There was an error: " + e.message)
      }
    }

    fetchData()
    return () => {
      cancelRequest.cancel()
    }
  }, [username])

  async function handleStartFollow() {
    setState(draft => {
      draft.startFollowCount++
    })
  }

  async function handleStopFollow() {
    setState(draft => {
      draft.stopFollowCount++
    })
  }

  useEffect(() => {
    if (state.startFollowCount) {
      setState(draft => {
        draft.isFollowLoading = true
      })

      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.username}`,
            { token: appState.user.token },
            { cancelToken: ourRequest.token }
          )
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.followers++
            draft.isFollowLoading = false
          })
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowCount])

  useEffect(() => {
    if (state.stopFollowCount) {
      setState(draft => {
        draft.isFollowLoading = true
      })

      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.username}`,
            { token: appState.user.token },
            { cancelToken: ourRequest.token }
          )
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.followers--
            draft.isFollowLoading = false
          })
        } catch (e) {
          console.log("There was a problem.")
        }
      }
      fetchData()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowCount])

  return (
    <Page title="Profile">
      <h2>
        <img className="avatar-small" src={state.profileData.avatar} />{" "}
        {username}
        {appState.loggedIn &&
          appState.user.username != username &&
          !state.profileData.isFollowing &&
          state.profileData.username != "..." && (
            <button
              onClick={handleStartFollow}
              disabled={state.isFollowLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          appState.user.username != username &&
          state.profileData.isFollowing &&
          state.profileData.username != "..." && (
            <button
              onClick={handleStopFollow}
              disabled={state.isFollowLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Unfollow <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="active nav-item nav-link">
          Posts: {state.profileData.posts}
        </NavLink>

        <NavLink to="followers" className="active nav-item nav-link">
          Followers: {state.profileData.followers}
        </NavLink>

        <NavLink to="following" className="active nav-item nav-link">
          Following: {state.profileData.following}
        </NavLink>
      </div>

      <Routes>
        <Route path="" element={<ProfilePosts />} />
        <Route path="followers" element={<ProfileFollowers />} />
        <Route path="following" element={<ProfileFollowing />} />
      </Routes>
    </Page>
  )
}

export default Profile

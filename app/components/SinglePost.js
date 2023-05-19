import React, { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Axios from "axios"
import ReactMarkdown from "react-markdown"
import Tooltip from "@mui/material/Tooltip"

import Page from "./Page"
import LoadingDotsIcon from "./LoadingDotsIcon"
import NotFound from "./NotFound"
import { useContext } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function SinglePost() {
  const navigate = useNavigate()

  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.get(`http://localhost:8080/post/${id}`)
        console.log(response.data)
        setPost(response.data)
        setLoading(false)
      } catch (e) {
        console.log("There was an error " + e.message)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <Page title="...">
        {" "}
        <LoadingDotsIcon />{" "}
      </Page>
    )
  }

  if (!loading && !post) {
    return <NotFound />
  }

  function isOwner() {
    return appState.user.username == post.author.username
  }

  async function handleDelete() {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post?"
    )
    if (isConfirmed) {
      try {
        const response = await Axios.delete(
          `http://localhost:8080/post/${id}`,
          {
            data: { token: appState.user.token }
          }
        )
        if (response.data == "Success") {
          appDispatch({ type: "flashMessage", value: "Post deleted." })
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log("There was an error: " + e)
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Tooltip
              title="Edit"
              disableFocusListener
              disableTouchListener
              enterDelay={1000}
            >
              <Link to={`/post/${id}/edit`} className="text-primary mr-2">
                <i className="fas fa-edit"></i>
              </Link>
            </Tooltip>{" "}
            <Tooltip
              title="Delete"
              disableFocusListener
              disableTouchListener
              enterDelay={1000}
            >
              <a
                className="delete-post-button text-danger"
                onClick={handleDelete}
              >
                <i className="fas fa-trash"></i>
              </a>
            </Tooltip>
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to="#">
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on 2/10/2020
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
      </div>
    </Page>
  )
}

export default SinglePost

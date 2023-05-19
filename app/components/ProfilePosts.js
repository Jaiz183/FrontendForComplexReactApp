import React, { useEffect, useState } from "react"
import Axios from "axios"
import { Link, useParams } from "react-router-dom"

import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts() {
  const { username } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`)
        // console.log(response.data)
        setLoading(false)
        setPosts(response.data)
      } catch (e) {
        console.log("There was an error: " + e.message)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingDotsIcon />
  }

  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post post={post} noAuthor={true} />
      })}
    </div>
  )
}

export default ProfilePosts

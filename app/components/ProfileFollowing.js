import React, { useEffect, useState } from "react"
import Axios from "axios"
import { Link, useParams } from "react-router-dom"

import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowing() {
  const { username } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.get(
          `http://localhost:8080/profile/${username}/following`
        )
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
      {posts.map((follower, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${follower.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={follower.avatar} />
            {follower.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowing

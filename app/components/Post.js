import React from "react"
import { Link } from "react-router-dom"

function Post(props) {
  const createdDate = new Date(props.post.createdDate)

  return (
    <Link
      onClick={props.onClick}
      to={`/post/${props.post._id}`}
      className="list-group-item list-group-item-action"
    >
      <img className="avatar-tiny" src={props.post.author.avatar} />{" "}
      <strong>{props.post.title + " "}</strong>
      <span className="text-muted small">
        {" "}
        {!props.noAuthor && (
          <>created by {props.post.author.username}</>
        )} on {createdDate.toUTCString()}{" "}
      </span>
    </Link>
  )
}

export default Post

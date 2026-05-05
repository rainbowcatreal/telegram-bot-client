import ErrorBoundary from "../protect/protect.jsx"
import "./message.css";

function Message(props) {
  const date = new Date(props.message.date * 1000);
  const time = date.toLocaleTimeString("ru-RU", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const text = props.message.text || props.message.caption;
  return <div className="message-row">
    <div className="message-avatar-group">
      <div className="message-avatar">
        <img src={props.message.photoUrl} />
      </div>
    </div>
    <div className="message-bubble">
      <div className="message-sender">
        <div className="message-sender-name">{props.message.sender_chat ? props.message.sender_chat.title : props.message.from.first_name}</div>
        <div className="message-sender-tag">{props.message.sender_tag || props.message.author_signature}</div>
      </div>
      { props.message.reply_to_message ?
        <div className="reply-block">
          <span className="reply-sender">{props.message.reply_to_message.sender_chat ? props.message.reply_to_message.sender_chat.title : props.message.reply_to_message.from.first_name}</span>
          <span className="reply-text">{props.message.reply_to_message.text || props.message.reply_to_message.caption}</span>
        </div>
      : "" }
      { props.photo ? <img className="message-photo" src={props.photo} /> : "" }
      <div className="message-text" style={{ whiteSpace: "pre-wrap" }}>{text}</div>
      <div className="message-meta">
        <div className="message-time">
          {time}
        </div>
      </div>
    </div>
  </div>;
};

export default Message;
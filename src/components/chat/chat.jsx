import classNames from "classnames";
import "./chat.css";

function Chat(props) {
  //console.log(props);
  const date = new Date(props.lastMessage.date * 1000);
  const time = date.toLocaleTimeString("ru-RU", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  return <div onClick={() => {props.selectChat(props.chat.id)}} className={classNames("chat-item", {
    active: props.selected
  })}>
    <div className="chat-item-pic">
      <img src={props.chat.photoUrl} />
    </div>
    <div className="chat-item-info">
      <div className="chat-item-header">
        <div className="chat-item-name">{props.chat.title}</div>
        <div className="chat-item-time">{time}</div>
      </div>
      <div className="chat-item-under">
        <div className="chat-item-last-msg">{props.lastMessage.text}</div>
      </div>
    </div>
  </div>;
}

export default Chat;
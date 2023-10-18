import "../styles/SideBar.css"

const SideBar = () => {

    return (
        <div className="sidebar">
            {true && <div className="pre-game-sidebar">
                <div className="button human-button">
                    <span className="title">Play Online</span>
                    <span className="subtitle">Play against another user</span>
                    <input className="id-input" placeholder="Game ID"></input>
                </div>
                <div className="button computer-button">
                    <span className="title">Play Computer</span>
                    <span className="subtitle">Play against a bot</span>
                </div>
            </div> }
            { false && <div className="game-sidebar">
                <div className="leave-game-button">
                    <span>Leave the game</span>
                </div>
            </div> }
        </div>
    );
}
export default SideBar;
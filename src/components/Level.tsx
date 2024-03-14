import "./../styles/Level.css";

interface Props {
    level: string,
    onLevelClicked: () => void,
}

const Level = ({level, onLevelClicked}: Props) => {

    return(
        <div className={`level ${level === "medium" ? "side-margin" : ""}`} onClick={() => onLevelClicked()}>
            <div className="level-image">
                <div className="level-column easy-column fullfil-column"></div>
                <div className={`level-column medium-column ${level !== "easy" ? "fullfil-column" : ""}`}></div>
                <div className={`level-column hard-column ${level === "hard" ? "fullfil-column" : ""}`}></div>
            </div>
            <span className="level-title">{level}</span>
        </div>
    )
}

export default Level;
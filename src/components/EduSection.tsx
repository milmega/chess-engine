import "../styles/EduSection.css"

interface Props {
    onEduExit: () => void
}

const EduSection: React.FC<Props> = ({onEduExit}) => {

    const onClickExitButton = () => {
        onEduExit();
    }

    return (
        <div className="edu-container">
            <div className="title-container">
                <div className="title">Learn more about AI algorithms</div>
                <div className="exit-button" onClick={onClickExitButton}>X</div>
            </div>
        </div>
    )
}
export default EduSection;
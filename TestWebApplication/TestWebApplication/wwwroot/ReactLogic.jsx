
class Task extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: props.task, Updating:false};//{Id: 1, title: 'title 1', description: 'description 1', stage:0 }

        this.onClickDelete = this.onClickDelete.bind(this);
        this.onClickUpdate = this.onClickUpdate.bind(this);
        this.onClickNextStage = this.onClickNextStage.bind(this);
        this.onSaveUpdates = this.onSaveUpdates.bind(this);
        this.onCancleUpdates = this.onCancleUpdates.bind(this);
    }

    onClickDelete() {

        var rqst = new XMLHttpRequest();
        var delId = this.state.data.Id;
        rqst.open("delete", "/api/Kanban/" + delId, true);
        rqst.onload = function () {
            this.props.onRemove(this.props.index);
        }.bind(this);
        rqst.onerror = function () {
            alert('Error');
        }
        rqst.send();
    }

    onClickUpdate() {
        this.setState({ Updating: true });
    }

    onClickNextStage() {

        var task = this.state.data;
        task.stage++;
        var rqst = new XMLHttpRequest();
        var data = JSON.stringify(task);
        rqst.open("post", "/api/Kanban", true);
        rqst.setRequestHeader("Content-type", "application/json");
        rqst.onload = function () {
            this.props.onNS(this.props.index);
        }.bind(this);
        rqst.onerror = function () {
            alert('Error');
        }
        rqst.send(data);
    }


    onSaveUpdates() {
        var task = { Id: this.state.data.Id, title: this.refs.newTitle.value, description: this.refs.newDescription.value, stage: this.state.data.stage };
        var rqst = new XMLHttpRequest();
        var data = JSON.stringify(task);
        rqst.open("post", "/api/Kanban", true);
        rqst.setRequestHeader("Content-type", "application/json");
        rqst.onload = function () {
            this.state.data = task;
            this.props.onUT(this.props.index, this.state.data);
            this.setState({ Updating: false });
        }.bind(this);
        rqst.onerror = function () {
            alert('Error');
            this.setState({ Updating: false });
        }
        rqst.send(data);
    }

    onCancleUpdates() {
        this.setState({ Updating: false });
    }


    render() {
        var stg = this.state.data.stage;
        var oCNS = this.onClickNextStage;
        if (!this.state.Updating) {
            return <div className="Task">
                TaskId:{this.state.data.Id}<br/>
                <h3>{this.state.data.title}</h3>
                <p>{this.state.data.description}</p>
                <button onClick={this.onClickDelete}>Delete</button>
                <button onClick={this.onClickUpdate}>Update</button>
                {function () {
                    if (stg < 2) return <button onClick={oCNS}>Next Stage</button>
                }()}
            </div>;
        }

        else {
            return <div className ="Task">
                TaskId:{this.state.data.Id}
                <textarea rows="1" ref="newTitle">{this.state.data.title}</textarea>
                <textarea className="DescriptionText" ref="newDescription">{this.state.data.description}</textarea>
                <button onClick={this.onCancleUpdates}>Cancle</button>
                <button onClick={this.onSaveUpdates}>Save</button>
            </div>;
        }
    }

}

class TaskColumn extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tasks: [] };

        this.onAddTask = this.onAddTask.bind(this);
        this.onRemoveTask = this.onRemoveTask.bind(this);
        this.onUpdateTask = this.onUpdateTask.bind(this);
        this.onAddToTable = this.onAddToTable.bind(this);

        this.onTaskStageUpdate = this.onTaskStageUpdate.bind(this);

        this.onAddToTable(this);
    }


    onTaskStageUpdate(i) {
        var tsk = this.state.tasks[i];
        this.onRemoveTask(i);
        this.props.moveTask(tsk);
    }


    onAddTask(task) {
        var arr = this.state.tasks;
        arr.unshift(task);
        this.setState({ tasks: arr });
    }

    onRemoveTask(i) {
        var arr = this.state.tasks;
        arr.splice(i,1);
        this.setState({ tasks: arr });
    }

    onUpdateTask(i, task) {
        var arr = this.state.tasks;
        arr[i] = task;
        this.setState({ tasks: arr });
    }

    onAddToTable(column)
    {
        this.props.addToTable(this);
    }

    render() {
        var rem = this.onRemoveTask;
        var move = this.onTaskStageUpdate;
        var upd = this.onUpdateTask;
        return <div className= "TColumn">
            {
                this.state.tasks.map(function (task, i) {
                    return <Task key={task.Id} index={i} task={task} onRemove={rem} onNS={move} onUT={upd}/>;
                })
            }
        </div>;

    }
}


class KanbanBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {columns: []};
        this.addColumn = this.addColumn.bind(this);
        this.addTaskToColumns = this.addTaskToColumns.bind(this);
        this.loadData = this.loadData.bind(this);
    }


    addColumn(column) {
        this.state.columns.push(column);
    }

    addTaskToColumns(task) {
        this.state.columns[task.stage].onAddTask(task);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        var rqst = new XMLHttpRequest();
        var Addfunc = this.addTaskToColumns;
        rqst.open("get", "/api/Kanban", true);
        rqst.onload = function () {
            var list = JSON.parse(rqst.responseText);
            list.map(function (elem) {
                elem.Id = elem.id;
                Addfunc(elem);
            });
        }.bind(this);
        rqst.onerror = function () {
            alert('Error');
        }
        rqst.send();
    }

    render() {
        return <div>
            <NewTaskForm moveTask={this.addTaskToColumns}/>
            <table>
                <tr>
                    <td>TO DO</td>
                    <td>IN PROGRESS</td>
                    <td>DONE</td>
                </tr>
                <tr>
                    <td>
                        <TaskColumn addToTable={this.addColumn} moveTask={this.addTaskToColumns}/>
                    </td>
                    <td>
                        <TaskColumn addToTable={this.addColumn} moveTask={this.addTaskToColumns}/>
                    </td>
                    <td>
                        <TaskColumn addToTable={this.addColumn} moveTask={this.addTaskToColumns}/>
                    </td>
                </tr>
            </table>
        </div>;
    }
}

class NewTaskForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { isOpen: false };

        this.onOpenOrClose = this.onOpenOrClose.bind(this);
        this.onAddNewTask = this.onAddNewTask.bind(this);
    }

    onOpenOrClose() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    onAddNewTask() {
        var tsk = {stage: 0 };
        tsk.title = this.refs.newTitle.value;
        tsk.description = this.refs.newDescription.value;
        var data = JSON.stringify(tsk);
        var rqst = new XMLHttpRequest();
        rqst.open("post", "/api/Kanban", true);
        rqst.setRequestHeader("Content-type","application/json");

        var mT = this.props.moveTask;
        var oOC = this.onOpenOrClose;

        rqst.onload = function () {
            tsk.Id = rqst.response;
            mT(tsk);
        }.bind(this);
        rqst.onerror = function () {
            alert('Error');
        }
        rqst.send(data);

        this.onOpenOrClose();
    }


    render() {
        if (this.state.isOpen == false){
            return < div className="NewTaskForm">
                <button onClick={this.onOpenOrClose}>Add new task</button>
            </div>
        }
        else {
            return <div className="NewTaskForm">
                Title:<br/>
                <textarea rows="1" ref="newTitle"></textarea><br />
                Description:<br/>
                <textarea className="DescriptionText" ref="newDescription"></textarea><br/>
                <button onClick={this.onOpenOrClose}>Cancle</button>
                <button onClick={this.onAddNewTask}>Add</button>
            </div>
        }
    }
}


ReactDOM.render(<KanbanBoard />, document.getElementById('root'));
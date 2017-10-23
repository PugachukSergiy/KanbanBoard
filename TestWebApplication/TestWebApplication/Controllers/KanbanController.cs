using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;

namespace TestWebApplication.Controllers
{
    public class KanbanTask
    {
        public int Id;
        public string title; 
        public string description;
        public int stage;
    }

    [Produces("application/json")]
    [Route("api/Kanban")]
    public class KanbanController : Controller
    {
        SqlConnection DbConnection = new SqlConnection("Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=KanbanBoard;Integrated Security=True;Connect Timeout=60;Encrypt=False;TrustServerCertificate=True;ApplicationIntent=ReadWrite;MultiSubnetFailover=False");

        // GET: api/Kanban
        [HttpGet]
        public IEnumerable<Object> Get()
        {
            using (DbConnection)
            {
                List<Object> Result = new List<Object>();
                DbConnection.Open();
                SqlCommand Command = new SqlCommand("select * from KB_Task", DbConnection);
                SqlDataReader SDR = Command.ExecuteReader();
                while (SDR.Read())
                {
                    var tsk = new { Id = SDR.GetInt32(0), title = SDR.GetString(1), description = SDR.GetString(2), stage = SDR.GetInt32(3) };
                    Result.Add(tsk);
                }
                return Result;
            }
        }

        // POST: api/Kanban
        [HttpPost]
        public int Post([FromBody]KanbanTask value)
        {
            using (DbConnection)
            {
                DbConnection.Open();
                if (value.Id == 0)
                {
                    SqlCommand Command = new SqlCommand("insert into KB_Task(Title, Description, Stage) values ('" + value.title + "', '" + value.description + "', " + value.stage + ") select @@IDENTITY as 'IDENTITY'", DbConnection);
                    SqlDataReader SDR = Command.ExecuteReader();
                    SDR.Read();
                    return (int)SDR.GetSqlDecimal(0);
                }
                else
                {
                    SqlCommand Command = new SqlCommand("update KB_Task set Title = '" + value.title + "', [Description] = '" + value.description + "', Stage = " + value.stage + " where Id = " + value.Id, DbConnection);
                    SqlDataReader SDR = Command.ExecuteReader();
                    return 0;
                }
            }

        }
        
        // DELETE: api/ApiWithActions/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            using (DbConnection)
            {
                DbConnection.Open();
                SqlCommand Command = new SqlCommand("delete from KB_Task where Id = "+ id, DbConnection);
                Command.ExecuteReader();
            }
        }
    }
}

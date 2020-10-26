using System.Collections;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.Api.Controllers
{
    [AllowAnonymous]
    [Route("api/values")]
    public class ValuesController : Controller
    {
        private readonly DatingContext _context;
        public ValuesController(DatingContext context)
        {
            this._context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetValues()
        {
            var values= await _context.Values.ToListAsync();

            return  Ok(values);
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetValues(int id)
        {
            var value = await _context.Values.FirstOrDefaultAsync(v => v.Id == id);

            if(value == null) return NotFound();

            return Ok(value);
        }
    }
}
using FA13DeliveryApi.Data;
using FA13DeliveryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FA13DeliveryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly AppDbContext _db;
        public MenuController(AppDbContext db) => _db = db;

        // GET: api/menu
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var menu = await _db.MenuItems.AsNoTracking().ToListAsync();
            return Ok(menu);
        }

        // GET: api/menu/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _db.MenuItems.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST: api/menu
        [HttpPost]
        public async Task<IActionResult> Create(MenuItem model)
        {
            _db.MenuItems.Add(model);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
        }

        // PUT: api/menu/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, MenuItem model)
        {
            if (id != model.Id) return BadRequest();
            var existing = await _db.MenuItems.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = model.Name;
            existing.Description = model.Description;
            existing.Price = model.Price;
            existing.ImageUrl = model.ImageUrl;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/menu/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.MenuItems.FindAsync(id);
            if (existing == null) return NotFound();
            _db.MenuItems.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}

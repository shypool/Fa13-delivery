using FA13DeliveryApi.Data;
using FA13DeliveryApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FA13DeliveryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(AppDbContext db, ILogger<OrdersController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderCreateDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.CustomerName) ||
                string.IsNullOrWhiteSpace(dto.Address) || string.IsNullOrWhiteSpace(dto.Phone))
            {
                return BadRequest("Informations client manquantes.");
            }

            var order = new Order
            {
                CustomerName = dto.CustomerName,
                Address = dto.Address,
                Phone = dto.Phone,
                Notes = dto.Notes,
                TotalPrice = dto.TotalPrice,
                ItemsJson = JsonSerializer.Serialize(dto.Items)
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Ici tu peux lancer une notification, envoyer SMS ou webhook
            _logger.LogInformation("Nouvelle commande reçue: {OrderId}", order.Id);

            return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
        }

        // GET: api/orders
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _db.Orders.AsNoTracking().OrderByDescending(o => o.CreatedAt).ToListAsync();
            return Ok(orders);
        }

        // GET: api/orders/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        // PUT: api/orders/5/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = dto.Status ?? order.Status;
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }

    // DTOs
    public record OrderItemDto(string Id, string Name, decimal Price, int Quantity);
    public record OrderCreateDto(string CustomerName, string Address, string Phone, decimal TotalPrice, IEnumerable<OrderItemDto> Items, string? Notes);
    public record UpdateStatusDto(string? Status);
}

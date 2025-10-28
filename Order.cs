using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FA13DeliveryApi.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string CustomerName { get; set; } = null!;

        [Required]
        public string Address { get; set; } = null!;

        [Required]
        public string Phone { get; set; } = null!;

        public string? Notes { get; set; }

        [Required]
        public decimal TotalPrice { get; set; }

        public string Status { get; set; } = "En préparation";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Store order items as JSON text (simple approach). For a normalized model, create an OrderItem entity.
        [Column(TypeName = "TEXT")]
        public string ItemsJson { get; set; } = "[]";
    }
}

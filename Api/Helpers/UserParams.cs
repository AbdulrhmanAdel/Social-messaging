namespace Api.Helpers
{
    public class UserParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize)? MaxPageSize : value; }
        }        
        public int TotalCount { get; set; }
        public int UserId { get; set; }
        public string Gender { get; set; }
        public int MinAge { get; set; } = 20;
        public int MaxAge { get; set; } = 60;
        public string OrderBy { get; set; }
        public bool Likees { get; set; } = false;
        public bool Likers { get; set; } = false;

    }
}
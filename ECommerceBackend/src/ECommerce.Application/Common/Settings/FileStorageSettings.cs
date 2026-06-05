namespace ECommerce.Application.Common.Settings;

public class FileStorageSettings
{
    public const string SectionName = "FileStorage";
    public string UploadPath { get; set; } = "uploads";
    public string BaseUrl { get; set; } = "/uploads";
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
}

class AuthToken {
  final String accessToken;
  final String tokenType;
  final DateTime? expiredAt;

  const AuthToken({
    required this.accessToken,
    required this.tokenType,
    this.expiredAt,
  });

  factory AuthToken.fromJson(Map<String, dynamic> json) {
    return AuthToken(
      accessToken: json['token'] as String,
      tokenType: json['tokenType'] as String,
      expiredAt: json['expiredAt'] != null
          ? DateTime.parse(json['expiredAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': accessToken,
      'tokenType': tokenType,
      'expiredAt': expiredAt?.toIso8601String(),
    };
  }

  bool get isExpired {
    if (expiredAt == null) return false;
    return DateTime.now().isAfter(expiredAt!);
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthToken &&
        other.accessToken == accessToken &&
        other.tokenType == tokenType &&
        other.expiredAt == expiredAt;
  }

  @override
  int get hashCode {
    return accessToken.hashCode ^ tokenType.hashCode ^ expiredAt.hashCode;
  }
}
